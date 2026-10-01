import "server-only";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";

export async function loadProfile() {
  const supabase = await createAuthClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase, user: null, profile: null, error: null };
  const { data: profile, error } = await supabase.from("profiles")
    .select("id, first_name, last_name, avatar_url").eq("id", user.id).single();
  return { supabase, user, profile, error };
}

export async function requireProfile() {
  const result = await loadProfile();
  if (!result.user) redirect("/login");
  return { ...result, user: result.user };
}
