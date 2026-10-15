-- Read-only organizer profiles, reachable only through a published activity.
begin;
create or replace function private.week4_public_organizer(eid bigint) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'name',coalesce(nullif(btrim(concat_ws(' ',p.first_name,p.last_name)),''),'Community member'),
  'bio',p.bio,'occupation',p.occupation,'city',p.city,
  'avatarUrl',case when p.avatar_path is not null then '/api/week4/image?bucket=week4-avatars&path='||p.avatar_path else null end,
  'tags',coalesce((select jsonb_agg(t.tag_slug order by t.tag_slug) from public.week4_member_interest_tags t where t.user_id=p.id),'[]'::jsonb)
 ) from public.week4_profiles p
 where p.published and exists(select 1 from public.week4_events e where e.id=eid and e.creator_id=p.id);
$$;
create or replace function public.week4_public_organizer(eid bigint) returns jsonb
language sql stable security invoker set search_path='' as $$ select private.week4_public_organizer(eid); $$;
revoke all on function private.week4_public_organizer(bigint),public.week4_public_organizer(bigint) from public,anon,authenticated;
grant execute on function private.week4_public_organizer(bigint),public.week4_public_organizer(bigint) to anon,authenticated;

create or replace function private.week4_public_avatar(image_name text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.week4_profiles p where p.published and p.avatar_path=image_name
 and exists(select 1 from public.week4_events e where e.creator_id=p.id));
$$;
revoke all on function private.week4_public_avatar(text) from public,anon,authenticated;
grant execute on function private.week4_public_avatar(text) to anon,authenticated;
drop policy if exists week4_published_organizer_avatar on storage.objects;
create policy week4_published_organizer_avatar on storage.objects for select to anon
using(bucket_id='week4-avatars' and private.week4_public_avatar(name));
commit;
