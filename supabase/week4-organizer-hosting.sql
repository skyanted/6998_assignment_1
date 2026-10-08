alter table public.week4_ai_generations alter column round_id drop not null;
alter table public.week4_events alter column round_id drop not null;
alter table public.week4_events add column hosting_status text not null default 'undecided' check(hosting_status in ('undecided','confirmed','cancelled'));
update public.week4_events set hosting_status='confirmed' where confirmed_at is not null;
create table public.week4_upvote_history(user_id uuid not null references auth.users(id) on delete cascade,event_id bigint not null references public.week4_events(id) on delete cascade,upvoted_at timestamptz not null default now(),primary key(user_id,event_id));
alter table public.week4_upvote_history enable row level security;
revoke all on public.week4_upvote_history from public,anon,authenticated;
grant select on public.week4_upvote_history to authenticated;
create policy history_read on public.week4_upvote_history for select to authenticated using(user_id=(select auth.uid()));
insert into public.week4_upvote_history(user_id,event_id,upvoted_at) select user_id,event_id,created_at from public.week4_votes where value=1 on conflict do nothing;
create or replace function private.week4_begin_generation(p_inputs jsonb,p_prompt text,p_model text,p_image text) returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); gid bigint; begin
 if uid is null or not exists(select 1 from public.week4_profiles where id=uid and published) then raise exception 'Complete Profile first'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,4));
 if (select count(*) from public.week4_ai_generations where user_id=uid and created_at>now()-interval '1 day')>=10 or exists(select 1 from public.week4_ai_generations where user_id=uid and created_at>now()-interval '30 seconds') then raise exception 'Generation limit reached. Try again later'; end if;
 insert into public.week4_ai_generations(user_id,inputs,prompt,model,image_path) values(uid,p_inputs,p_prompt,p_model,p_image) returning id into gid;
 return gid;
end; $$;
create or replace function private.week4_publish(gid bigint,event_time timestamptz) returns bigint language plpgsql security definer set search_path='' as $$
declare g public.week4_ai_generations; eid bigint; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,4));
 select * into g from public.week4_ai_generations where id=gid and user_id=auth.uid() and status='ready' for update;
 if not found then raise exception 'Generation unavailable'; end if;
 if event_time is null or event_time<=clock_timestamp() then raise exception 'Choose a future start time'; end if;
 if g.image_path is null and not exists(select 1 from public.week4_covers where id=g.output->>'cover_id') then raise exception 'AI must select a default cover'; end if;
 insert into public.week4_events(creator_id,generation_id,round_id,title,description,format,place_id,location,starts_at,duration_minutes,budget,capacity,cover_id,image_path)
 values(auth.uid(),gid,g.round_id,g.output->>'title',g.output->>'description',g.output->>'format',g.output->>'place_id',g.output->>'location',event_time,(g.output->>'duration_minutes')::integer,(g.output->>'budget')::numeric,(g.output->>'capacity')::integer,case when g.image_path is null then g.output->>'cover_id' else null end,g.image_path) returning id into eid;
 if jsonb_array_length(g.output->'tags')>3 then raise exception 'Too many tags'; end if;
 insert into public.week4_event_tags select eid,x from jsonb_array_elements_text(g.output->'tags') x;
 update public.week4_ai_generations d set status='discarded'
 where d.user_id=auth.uid() and d.id<>gid and d.status in ('pending','ready')
 and not exists(select 1 from public.week4_events e where e.generation_id=d.id);
 return eid;
end; $$;
create or replace function private.week4_vote(eid bigint,v integer) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); e public.week4_events; oldv integer:=0; begin
 if uid is null then raise exception 'Sign in to vote'; end if;
 if v not in (-1,0,1) or v is null then raise exception 'Invalid vote'; end if;
 select * into e from public.week4_events where id=eid for update;
 if not found then raise exception 'Event unavailable'; end if;
 if e.hosting_status='cancelled' or clock_timestamp()>=e.starts_at+make_interval(mins=>e.duration_minutes) then raise exception 'Voting has ended'; end if;
 select value into oldv from public.week4_votes where event_id=eid and user_id=uid;
 oldv:=coalesce(oldv,0);
 if v=0 then delete from public.week4_votes where event_id=eid and user_id=uid;
 else insert into public.week4_votes(event_id,user_id,value) values(eid,uid,v) on conflict(event_id,user_id) do update set value=excluded.value; end if;
 if v=1 then insert into public.week4_upvote_history(user_id,event_id) values(uid,eid) on conflict do nothing; end if;
 update public.week4_events set upvotes=upvotes+(case when v=1 then 1 else 0 end)-(case when oldv=1 then 1 else 0 end),downvotes=downvotes+(case when v=-1 then 1 else 0 end)-(case when oldv=-1 then 1 else 0 end) where id=eid;
end; $$;
create or replace function private.week4_set_hosting(eid bigint,decision text,details text) returns void language plpgsql security definer set search_path='' as $$
declare e public.week4_events; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if decision not in ('confirmed','cancelled') or decision is null or details is null or char_length(details)>3000 or (decision='confirmed' and char_length(btrim(details))<1) then raise exception 'Choose a hosting decision and add details'; end if;
 select * into e from public.week4_events where id=eid and creator_id=auth.uid() for update;
 if not found then raise exception 'Only the organizer can decide hosting'; end if;
 if clock_timestamp()>=e.starts_at+make_interval(mins=>e.duration_minutes) then raise exception 'The activity has ended'; end if;
 update public.week4_events set hosting_status=decision,hosting_details=nullif(btrim(details),''),confirmed_at=case when decision='confirmed' then coalesce(confirmed_at,now()) else confirmed_at end where id=eid;
end; $$;
create or replace function private.week4_confirm(eid bigint,details text) returns void language sql security invoker set search_path='' as $$ select private.week4_set_hosting(eid,'confirmed',details); $$;
create or replace function public.week4_set_hosting(eid bigint,decision text,details text default '') returns void language sql security invoker set search_path='' as $$ select private.week4_set_hosting(eid,decision,details); $$;
revoke all on function private.week4_set_hosting(bigint,text,text),public.week4_set_hosting(bigint,text,text) from public,anon,authenticated;
grant execute on function private.week4_set_hosting(bigint,text,text),public.week4_set_hosting(bigint,text,text) to authenticated;
select cron.unschedule(jobid) from cron.job where jobname='week4-settle';
drop function if exists private.week4_settle();
drop function if exists private.week4_next_close();
