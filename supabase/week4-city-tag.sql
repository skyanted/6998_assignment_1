insert into public.week4_interest_tags(slug,label) values('city','City') on conflict(slug) do update set label=excluded.label;
delete from public.week4_member_interest_tags old where old.tag_slug='nyc' and exists(select 1 from public.week4_member_interest_tags n where n.user_id=old.user_id and n.tag_slug='city');
update public.week4_member_interest_tags set tag_slug='city' where tag_slug='nyc';
delete from public.week4_event_tags old where old.tag_slug='nyc' and exists(select 1 from public.week4_event_tags n where n.event_id=old.event_id and n.tag_slug='city');
update public.week4_event_tags set tag_slug='city' where tag_slug='nyc';
update public.week4_ai_generations set output=jsonb_set(output,'{tags}',(select jsonb_agg(distinct case when t='nyc' then 'city' else t end) from jsonb_array_elements_text(output->'tags') t)) where output->'tags' ? 'nyc';
delete from public.week4_interest_tags where slug='nyc';
