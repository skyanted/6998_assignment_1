-- Week 4 generation limits: 20 attempts per rolling day, 10-second cooldown.
begin;
create or replace function private.week4_begin_generation(p_inputs jsonb,p_prompt text,p_model text,p_image text) returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); gid bigint; begin
 if uid is null then raise exception 'Sign in first'; end if;
 perform private.week4_profile_save(null,'{}'::text[]);
 perform pg_advisory_xact_lock(hashtextextended(uid::text,4));
 if (select count(*) from public.week4_ai_generations where user_id=uid and created_at>now()-interval '1 day')>=20 then
  raise exception 'Generation limit reached. You can generate up to 20 events in 24 hours. Try again later.';
 end if;
 if exists(select 1 from public.week4_ai_generations where user_id=uid and created_at>now()-interval '10 seconds') then
  raise exception 'Generation limit reached. Please wait at least 10 seconds between generations.';
 end if;
 insert into public.week4_ai_generations(user_id,inputs,prompt,model,image_path) values(uid,p_inputs,p_prompt,p_model,p_image) returning id into gid;
 return gid;
end; $$;
commit;
