-- Run this once in the existing project's Supabase SQL Editor.
-- Keep public.profiles unchanged so Assignment 2 commit URLs still work.
begin;

create schema if not exists account;
revoke all on schema account from public;
grant usage on schema account to authenticated, service_role;

create table if not exists account.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (first_name is null or char_length(first_name) between 1 and 100),
  last_name text check (last_name is null or char_length(last_name) between 1 and 100),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table account.profiles enable row level security;
revoke all on account.profiles from anon, authenticated;
grant select on account.profiles to authenticated;
grant update (first_name, last_name, avatar_url) on account.profiles to authenticated;
grant all on account.profiles to service_role;

drop policy if exists "Read own profile" on account.profiles;
create policy "Read own profile" on account.profiles for select to authenticated
using ((select auth.uid()) = id);
drop policy if exists "Update own profile" on account.profiles;
create policy "Update own profile" on account.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Keep the privileged trigger function outside the exposed public schema.
create schema if not exists private;
revoke all on schema private from public;
create or replace function private.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into account.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.create_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_assignment3 on auth.users;
create trigger on_auth_user_created_assignment3 after insert on auth.users
for each row execute function private.create_user_profile();

-- Include users who signed in before this trigger was installed.
insert into account.profiles (id) select id from auth.users on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Upload own avatar" on storage.objects;
create policy "Upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Read own avatar object" on storage.objects;
create policy "Read own avatar object" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Delete own avatar" on storage.objects;
create policy "Delete own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;

-- Verify profiles.id is UUID, the trigger exists, and the bucket is configured.
select column_name, data_type, is_nullable from information_schema.columns
where table_schema = 'account' and table_name = 'profiles';
select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
select id, public, file_size_limit from storage.buckets where id = 'avatars';
