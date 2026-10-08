alter table public.week4_ai_generations drop constraint week4_ai_generations_status_check;
alter table public.week4_ai_generations add constraint week4_ai_generations_status_check check(status in ('pending','ready','failed','discarded'));

create or replace function private.week4_publish(gid bigint,event_time timestamptz) returns bigint language plpgsql security definer set search_path='' as $$
declare g public.week4_ai_generations; r public.week4_rounds; eid bigint; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,4));
 select * into g from public.week4_ai_generations where id=gid and user_id=auth.uid() and status='ready' for update;
 if not found then raise exception 'Generation unavailable'; end if;
 select * into r from public.week4_rounds where id=g.round_id for share;
 if clock_timestamp()>=r.closes_at or event_time<=r.closes_at then raise exception 'Choose a time after this round''s Wednesday cutoff'; end if;
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
