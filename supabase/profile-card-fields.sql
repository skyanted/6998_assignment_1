-- Fields displayed on the member cards and edited in Dashboard.
alter table public.profile_cards
  add column username text check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  add column role text check (role is null or char_length(btrim(role)) between 1 and 50),
  add column city text check (city is null or char_length(btrim(city)) between 1 and 100),
  add column interests text[] not null default '{}' check (cardinality(interests) <= 10 and array_position(interests, null) is null),
  add column is_active boolean not null default true;

create unique index profile_cards_username_idx on public.profile_cards (username) where username is not null;
grant insert (username, role, city, interests, is_active) on public.profile_cards to authenticated;
grant update (username, role, city, interests, is_active) on public.profile_cards to authenticated;
comment on column public.profile_cards.role is 'Public descriptive occupation/role, not an authorization role.';
