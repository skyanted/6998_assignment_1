-- Migrate the former posts table without deleting any saved content.
alter table public.posts rename to profile_cards;
alter table public.profile_cards rename column title to headline;
alter table public.profile_cards rename column content to bio;
alter table public.profile_cards rename constraint posts_pkey to profile_cards_pkey;
alter table public.profile_cards rename constraint posts_user_id_fkey to profile_cards_user_id_fkey;
alter table public.profile_cards rename constraint posts_title_check to profile_cards_headline_check;
alter table public.profile_cards rename constraint posts_content_check to profile_cards_bio_check;
alter index public.posts_updated_at_idx rename to profile_cards_updated_at_idx;

alter table public.profile_cards add column display_name text not null default '';
alter table public.profile_cards add column avatar_url text;
update public.profile_cards c
set display_name = concat_ws(' ', p.first_name, p.last_name), avatar_url = p.avatar_url
from account.profiles p where p.id = c.user_id;

alter policy "Read public posts" on public.profile_cards rename to "Read public profile cards";
alter policy "Create own post" on public.profile_cards rename to "Create own profile card";
alter policy "Edit own post" on public.profile_cards rename to "Edit own profile card";
grant insert (display_name, avatar_url) on public.profile_cards to authenticated;
grant update (display_name, avatar_url) on public.profile_cards to authenticated;

alter function private.set_post_updated_at() rename to set_profile_card_updated_at;
alter trigger on_post_updated on public.profile_cards rename to on_profile_card_updated;

-- A profile update refreshes only its already-published personal card.
-- This private trigger needs definer privileges to update the public snapshot.
create function private.refresh_profile_card_identity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is not null and (select auth.uid()) <> new.id then
    raise exception 'Cannot synchronize another user profile' using errcode = '42501';
  end if;
  update public.profile_cards
  set display_name = concat_ws(' ', new.first_name, new.last_name), avatar_url = new.avatar_url
  where user_id = new.id;
  return new;
end;
$$;
revoke all on function private.refresh_profile_card_identity() from public, anon, authenticated;
create trigger on_profile_card_identity_changed
after update of first_name, last_name, avatar_url on account.profiles
for each row execute function private.refresh_profile_card_identity();

comment on table public.profile_cards is 'One public personal introduction card per user; created on first Dashboard save.';
comment on column public.profile_cards.headline is 'Short personal introduction headline.';
comment on column public.profile_cards.bio is 'Personal introduction text.';
