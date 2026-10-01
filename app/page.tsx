import type { Metadata } from "next";
import { connection } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import AccountNav from "@/app/components/account-nav";
import ProfileCard from "@/app/components/profile-card";
import type { ProfileCardData } from "@/lib/profile-card";

export const metadata: Metadata = { title: "Home | Assignment 3" };

export default async function Home() {
  await connection();
  let cards: Array<ProfileCardData & { user_id: string }> = [];
  let failed = false;
  try {
    const supabase = createSupabaseClient();
    const [personal, examples] = await Promise.all([
      supabase.from("profile_cards")
        .select("user_id, email, bio, display_name, avatar_url, role, city, interests, is_active, updated_at")
        .order("updated_at", { ascending: false }),
      supabase.from("profiles")
        .select("id, email, full_name, role, city, bio, interests, is_active, created_at")
        .order("id", { ascending: true }),
    ]);
    if (personal.error || examples.error) throw personal.error ?? examples.error;
    cards = [
      ...(personal.data ?? []),
      ...(examples.data ?? []).map(profile => ({
        user_id: `example-${profile.id}`,
        email: profile.email,
        display_name: profile.full_name,
        bio: profile.bio ?? "",
        avatar_url: null,
        updated_at: profile.created_at,
        dateLabel: "Joined" as const,
        role: profile.role,
        city: profile.city,
        interests: profile.interests,
        is_active: profile.is_active,
      })),
    ];
  } catch {
    failed = true;
  }

  return <main className="mx-auto w-full max-w-4xl px-6 py-12">
    <AccountNav />
    <h1 className="text-4xl font-bold">Home</h1>
    <p className="mt-3 mb-8">Sign in to create and edit your personal introduction card in Dashboard.</p>
    {failed ? <p role="alert">Unable to load profile cards. Please try again later.</p>
      : cards.length === 0 ? <p>No profile cards yet. Create yours in Dashboard.</p>
      : <ul className="grid gap-5 md:grid-cols-2">
        {cards.map(card => <li key={card.user_id}><ProfileCard card={card} /></li>)}
      </ul>}
  </main>;
}
