create table public.week4_covers (
 id text primary key, description text not null, image_path text not null check(image_path ~ '^/week4-covers/[a-z]+[.]jpg$'), source_url text not null
);
alter table public.week4_covers enable row level security;
revoke all on public.week4_covers from anon,authenticated;
grant select on public.week4_covers to anon,authenticated;
create policy covers_read on public.week4_covers for select to anon,authenticated using(true);
insert into public.week4_covers(id,description,image_path,source_url) values
('outdoors','Friends hiking a green mountain trail with backpacks; choose for hiking, nature and outdoor adventures.','/week4-covers/outdoors.jpg','https://www.pexels.com/photo/a-group-of-friends-hiking-together-11724800/'),
('food','People sharing pizza slices around a table; choose for shared meals, casual dining and food gatherings.','/week4-covers/food.jpg','https://www.pexels.com/photo/people-sharing-a-pizza-9543813/'),
('arts','An overhead group painting and crafts workspace with watercolor materials; choose for drawing, painting or creative workshops.','/week4-covers/arts.jpg','https://www.pexels.com/photo/people-in-an-art-workshop-6146655/'),
('sports','People playing basketball on an outdoor court; choose for basketball and team sports.','/week4-covers/sports.jpg','https://www.pexels.com/photo/men-playing-basketball-on-open-court-2820903/'),
('gaming','Friends enjoying a social game together at a table; choose for board games, party games and game nights, including online game socials.','/week4-covers/gaming.jpg','https://www.pexels.com/photo/friends-playing-on-the-table-8111359/'),
('study','Students with books and laptops in a library; choose for studying, reading and learning groups.','/week4-covers/study.jpg','https://www.pexels.com/photo/students-studying-inside-the-library-8199659/'),
('music','Friends playing acoustic guitar outdoors; choose for music, singing and jam sessions.','/week4-covers/music.jpg','https://www.pexels.com/photo/friends-spending-time-together-with-guitar-3777729/'),
('city','A city skyline and a large urban park; choose for city walks, sightseeing and urban exploration.','/week4-covers/city.jpg','https://www.pexels.com/photo/aerial-photography-of-central-park-and-buildings-in-new-york-city-11317199/');
alter table public.week4_events add column cover_id text references public.week4_covers(id);
create index week4_event_cover_idx on public.week4_events(cover_id);
create or replace function private.week4_publish(gid bigint,event_time timestamptz) returns bigint language plpgsql security definer set search_path='' as $$
declare g public.week4_ai_generations; r public.week4_rounds; eid bigint; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into g from public.week4_ai_generations where id=gid and user_id=auth.uid() and status='ready' for update;
 if not found then raise exception 'Generation unavailable'; end if;
 select * into r from public.week4_rounds where id=g.round_id for share;
 if clock_timestamp()>=r.closes_at or event_time<=r.closes_at or event_time>r.closes_at+interval '7 days' then raise exception 'Choose a time after this Wednesday cutoff and within the following seven days'; end if;
 if g.image_path is null and not exists(select 1 from public.week4_covers where id=g.output->>'cover_id') then raise exception 'AI must select a default cover'; end if;
 insert into public.week4_events(creator_id,generation_id,round_id,title,description,format,place_id,location,starts_at,duration_minutes,budget,capacity,cover_id,image_path)
 values(auth.uid(),gid,g.round_id,g.output->>'title',g.output->>'description',g.output->>'format',g.output->>'place_id',g.output->>'location',event_time,(g.output->>'duration_minutes')::integer,(g.output->>'budget')::numeric,(g.output->>'capacity')::integer,case when g.image_path is null then g.output->>'cover_id' else null end,g.image_path) returning id into eid;
 if jsonb_array_length(g.output->'tags')>3 then raise exception 'Too many tags'; end if;
 insert into public.week4_event_tags select eid,x from jsonb_array_elements_text(g.output->'tags') x;
 return eid;
end; $$;
