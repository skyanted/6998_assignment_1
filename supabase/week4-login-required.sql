do $$ declare t text; begin for t in select tablename from pg_tables where schemaname='public' and tablename like 'week4_%' loop
 execute format('revoke all on public.%I from anon',t);
end loop; end $$;
alter policy covers_read on public.week4_covers to authenticated;
alter policy tags_read on public.week4_interest_tags to authenticated;
alter policy profiles_read on public.week4_profiles to authenticated;
alter policy member_tags_read on public.week4_member_interest_tags to authenticated;
alter policy rounds_read on public.week4_rounds to authenticated;
alter policy events_read on public.week4_events to authenticated;
alter policy event_tags_read on public.week4_event_tags to authenticated;
update storage.buckets set public=false,file_size_limit=3145728 where id='week4-avatars';
alter policy week4_image_read on storage.objects to authenticated using(
 (bucket_id='week4-avatars' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.week4_profiles p where p.published and p.avatar_path=name)))
 or (bucket_id='week4-event-images' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.week4_events e where e.image_path=name)))
);
create table private.week4_generation_config(singleton boolean primary key default true check(singleton),secret_hash text not null);
alter table private.week4_generation_config enable row level security;
create policy week4_config_deny_clients on private.week4_generation_config for all to anon,authenticated using(false) with check(false);
revoke all on private.week4_generation_config from public,anon,authenticated;
insert into private.week4_generation_config(singleton,secret_hash) values(true,'f38a875bc45c4df5f2259d45dce4fd49');
drop function public.week4_finish_generation(bigint,jsonb,jsonb);
drop function private.week4_finish_generation(bigint,jsonb,jsonb);
create or replace function private.week4_finish_generation(gid bigint,result jsonb,original_result jsonb default null,generation_proof text default null) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if generation_proof is null or not exists(select 1 from private.week4_generation_config where singleton and secret_hash=md5(generation_proof)) then raise exception 'Only the application can save AI output'; end if;
 update public.week4_ai_generations set output=result,original_output=coalesce(original_result,result),status=case when result is null then 'failed' else 'ready' end where id=gid and user_id=auth.uid() and status='pending';
 if not found then raise exception 'Generation unavailable'; end if;
end; $$;
create function public.week4_finish_generation(gid bigint,result jsonb,original_result jsonb default null,generation_proof text default null) returns void language sql security invoker set search_path='' as $$ select private.week4_finish_generation(gid,result,original_result,generation_proof); $$;
revoke all on function private.week4_finish_generation(bigint,jsonb,jsonb,text),public.week4_finish_generation(bigint,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function private.week4_finish_generation(bigint,jsonb,jsonb,text),public.week4_finish_generation(bigint,jsonb,jsonb,text) to authenticated;
