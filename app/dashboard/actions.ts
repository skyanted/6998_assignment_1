"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/profile";

export type CardState = { message: string; saved: boolean };

export async function saveProfileCard(_previous: CardState, formData: FormData): Promise<CardState> {
  const { supabase, user, profile, error: profileError } = await requireProfile();
  if (profileError || !profile?.first_name?.trim() || !profile?.last_name?.trim()) {
    return { message: "Complete your first and last name in Profile before saving your card.", saved: false };
  }
  const bio = formData.get("bio");
  if (typeof bio !== "string"
    || !bio.trim() || bio.trim().length > 5000) {
    return { message: "Enter a bio (up to 5,000 characters).", saved: false };
  }
  const emailInput = formData.get("email");
  const roleInput = formData.get("role");
  const cityInput = formData.get("city");
  const interestsInput = formData.get("interests");
  if ([emailInput, roleInput, cityInput, interestsInput].some(value => typeof value !== "string")) {
    return { message: "Check your card details and try again.", saved: false };
  }
  const email = (emailInput as string).trim().toLowerCase() || null;
  const role = (roleInput as string).trim() || null;
  const city = (cityInput as string).trim() || null;
  const interests = [...new Set((interestsInput as string).split(",").map(value => value.trim()).filter(Boolean))];
  if ((email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) || (role && role.length > 50)
    || (city && city.length > 100)) {
    return { message: "Enter a valid email (up to 254 characters), a role up to 50 characters, and a city up to 100.", saved: false };
  }
  if (interests.length > 3 || interests.some(value => Array.from(value).length > 20)) {
    return { message: "Use up to 3 interest tags, with no more than 20 characters per tag.", saved: false };
  }
  const cards = supabase.schema("public").from("profile_cards");
  const values = {
    bio: bio.trim(),
    display_name: `${profile.first_name.trim()} ${profile.last_name.trim()}`,
    avatar_url: profile.avatar_url,
    email, role, city, interests, is_active: formData.get("is_active") === "on",
  };
  const { data: existing, error: readError } = await cards.select("user_id").eq("user_id", user.id).maybeSingle();
  if (readError) return { message: "Unable to load your profile card. Please try again.", saved: false };
  let result = existing
    ? await cards.update(values).eq("user_id", user.id).select("user_id").single()
    : await cards.insert({ user_id: user.id, ...values }).select("user_id").single();
  // Simultaneous first saves from two tabs still produce one card per user.
  if (!existing && result.error?.code === "23505" && result.error.message.includes("profile_cards_pkey")) {
    result = await cards.update(values).eq("user_id", user.id).select("user_id").single();
  }
  if (result.error || !result.data) return { message: "Unable to save your profile card. Please try again.", saved: false };
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { message: "Your profile card is saved and visible on Home.", saved: true };
}
