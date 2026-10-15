-- Week 4 discovery and deferred profile completion. No earlier assignment tables are altered.
begin;
create or replace function private.week4_begin_generation(p_inputs jsonb,p_prompt text,p_model text,p_image text) returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); gid bigint; begin
 if uid is null then raise exception 'Sign in first'; end if;
 perform private.week4_profile_save(null,'{}'::text[]);
 perform pg_advisory_xact_lock(hashtextextended(uid::text,4));
 if (select count(*) from public.week4_ai_generations where user_id=uid and created_at>now()-interval '1 day')>=10 or exists(select 1 from public.week4_ai_generations where user_id=uid and created_at>now()-interval '30 seconds') then raise exception 'Generation limit reached. Try again later'; end if;
 insert into public.week4_ai_generations(user_id,inputs,prompt,model,image_path) values(uid,p_inputs,p_prompt,p_model,p_image) returning id into gid;
 return gid;
end; $$;
create or replace function private.week4_publish(gid bigint,event_time timestamptz) returns bigint language plpgsql security definer set search_path='' as $$
declare g public.week4_ai_generations; eid bigint; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if not exists(select 1 from public.week4_profiles where id=auth.uid() and nullif(btrim(first_name),'') is not null and nullif(btrim(last_name),'') is not null) then raise exception 'Add your first and last name before publishing'; end if;
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
-- Public discovery exposes published activity fields and display names only.
-- Base tables, drafts, contact emails and personal vote records remain private.
create or replace function private.week4_public_feed() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(item order by published_at desc),'[]'::jsonb) from (
  select e.published_at,jsonb_build_object(
   'id',e.id,'title',e.title,'description',e.description,'format',e.format,
   'place_id',e.place_id,'location',e.location,'starts_at',e.starts_at,
   'duration_minutes',e.duration_minutes,'budget',e.budget,'capacity',e.capacity,
   'upvotes',e.upvotes,'downvotes',e.downvotes,'hosting_status',e.hosting_status,
   'confirmed_at',e.confirmed_at,'hosting_details',e.hosting_details,'published_at',e.published_at,
   'imageUrl',case when e.image_path is not null then '/api/week4/image?bucket=week4-event-images&path='||e.image_path when e.cover_id is not null then '/api/week4/cover/'||e.cover_id else null end,
   'creator',coalesce(nullif(btrim(concat_ws(' ',p.first_name,p.last_name)),''),'Community member'),
   'tags',coalesce((select jsonb_agg(t.tag_slug order by t.tag_slug) from public.week4_event_tags t where t.event_id=e.id),'[]'::jsonb)
  ) item
  from public.week4_events e join public.week4_profiles p on p.id=e.creator_id
 ) published;
$$;
create or replace function public.week4_public_feed() returns jsonb
language sql stable security invoker set search_path='' as $$ select private.week4_public_feed(); $$;
revoke all on function private.week4_public_feed(),public.week4_public_feed() from public,anon,authenticated;
grant usage on schema private to anon;
grant execute on function private.week4_public_feed(),public.week4_public_feed() to anon,authenticated;

-- A narrow predicate lets Storage serve published uploads without exposing drafts.
create or replace function private.week4_published_image(image_name text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.week4_events where image_path=image_name);
$$;
revoke all on function private.week4_published_image(text) from public,anon,authenticated;
grant execute on function private.week4_published_image(text) to anon,authenticated;
create index if not exists week4_public_image_idx on public.week4_events(image_path) where image_path is not null;
drop policy if exists week4_published_image_read on storage.objects;
create policy week4_published_image_read on storage.objects for select to anon
using(bucket_id='week4-event-images' and private.week4_published_image(name));
commit;
