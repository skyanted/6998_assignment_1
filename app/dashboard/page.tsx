import { redirect } from "next/navigation";
import AccountNav from "@/app/components/account-nav";
import { loadProfile } from "@/lib/profile";
import SignInPrompt from "@/app/components/sign-in-prompt";
import CardForm from "./card-form";

export default async function Dashboard() {
  const { supabase, user, profile, error } = await loadProfile();
  if (!user) return <main className="mx-auto w-full max-w-4xl px-6 py-12">
    <AccountNav />
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <SignInPrompt section="Dashboard" />
  </main>;
  if (error || !profile?.first_name?.trim() || !profile?.last_name?.trim()) redirect("/profile");
  const { data: card, error: cardError } = await supabase.schema("public").from("profile_cards")
    .select("email, bio, role, city, interests, is_active, updated_at").eq("user_id", user.id).maybeSingle();
  return <main className="mx-auto w-full max-w-4xl px-6 py-12">
    <AccountNav />
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <p className="my-6">{card ? "Edit your personal introduction card. Saved changes appear on Home." : "Create your personal introduction card. It will appear on Home when you save."}</p>
    {cardError ? <p role="alert">Your profile card could not be loaded. Please try again later.</p> : <CardForm card={card} displayName={`${profile.first_name.trim()} ${profile.last_name.trim()}`} avatarUrl={profile.avatar_url} />}
  </main>;
}
