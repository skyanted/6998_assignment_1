alter table public.profile_cards add constraint profile_cards_interest_tag_limits
check (
  cardinality(interests) <= 3
  and coalesce(array_ndims(interests), 1) = 1
  and coalesce(array_lower(interests, 1), 1) = 1
  and array_position(interests, null) is null
  and coalesce(char_length(btrim(interests[1])), 1) between 1 and 20
  and coalesce(char_length(btrim(interests[2])), 1) between 1 and 20
  and coalesce(char_length(btrim(interests[3])), 1) between 1 and 20
);
