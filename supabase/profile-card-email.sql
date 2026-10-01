-- Contact emails replace usernames in the Assignment 3 UI.
-- Preserve Assignment 2's original fields and rows for its existing deployments.
alter table public.profile_cards add column email text
  constraint profile_cards_email_check check (
    email is null or (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
  );
grant insert (email) on public.profile_cards to authenticated;
grant update (email) on public.profile_cards to authenticated;
comment on column public.profile_cards.email is 'Optional public contact email entered by the card owner; not used for authentication.';
alter table public.profiles add column email text;
update public.profiles set email = username || '@example.com'
where username in ('maya_chen', 'liam_brooks', 'sofia_martinez', 'noah_kim') and email is null;
