import AccountNav from "@/app/components/account-nav";
import { loadProfile } from "@/lib/profile";
import SignInPrompt from "@/app/components/sign-in-prompt";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const { user, profile, error } = await loadProfile();
  if (!user) return <main className="mx-auto w-full max-w-xl px-6 py-12">
    <AccountNav />
    <h1 className="text-3xl font-bold">Profile</h1>
    <SignInPrompt section="Profile" />
  </main>;
  const incomplete = !profile?.first_name?.trim() || !profile?.last_name?.trim();
  return <main className="mx-auto w-full max-w-xl px-6 py-12">
    <AccountNav />
    <h1 className="mb-6 text-3xl font-bold">Profile</h1>
    {error || !profile ? <p role="alert">Your profile could not be loaded. Please check the database setup and try again.</p> : <>
      {incomplete && <p className="mb-6">Please add your first and last name to complete your profile.</p>}
      <ProfileForm profile={profile} />
    </>}
  </main>;
}
