-- Public discovery is limited to card previews. Complete event plans require sign-in.
begin;
create or replace function private.week4_public_feed() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(item order by published_at desc),'[]'::jsonb) from (
  select e.published_at,jsonb_build_object(
   'id',e.id,'title',e.title,'description',left(e.description,240)||case when char_length(e.description)>240 then '…' else '' end,'format',e.format,
   'location',case when e.format='online' then 'Online' else split_part(e.location,',',1) end,'starts_at',e.starts_at,
   'duration_minutes',e.duration_minutes,
   'upvotes',e.upvotes,'downvotes',e.downvotes,'hosting_status',e.hosting_status,
   'published_at',e.published_at,
   'imageUrl',case when e.image_path is not null then '/api/week4/image?bucket=week4-event-images&path='||e.image_path when e.cover_id is not null then '/api/week4/cover/'||e.cover_id else null end,
   'creator',coalesce(nullif(btrim(concat_ws(' ',p.first_name,p.last_name)),''),'Community member'),
   'tags',coalesce((select jsonb_agg(t.tag_slug order by t.tag_slug) from public.week4_event_tags t where t.event_id=e.id),'[]'::jsonb)
  ) item
  from public.week4_events e join public.week4_profiles p on p.id=e.creator_id
 ) published;
$$;
commit;
