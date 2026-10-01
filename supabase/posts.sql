-- One public post per authenticated user; old Assignment 2 data is unchanged.
create table public.posts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 150),
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_updated_at_idx on public.posts (updated_at desc);
alter table public.posts enable row level security;
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert (user_id, title, content) on public.posts to authenticated;
grant update (title, content) on public.posts to authenticated;
grant all on public.posts to service_role;

create policy "Read public posts" on public.posts for select to anon, authenticated using (true);
create policy "Create own post" on public.posts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Edit own post" on public.posts for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function private.set_post_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_post_updated_at() from public, anon, authenticated;
create trigger on_post_updated before update on public.posts
for each row execute function private.set_post_updated_at();
