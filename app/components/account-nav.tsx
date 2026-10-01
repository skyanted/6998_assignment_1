import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function AccountNav() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <nav aria-label="Account" className="mb-8 flex flex-wrap items-center gap-5">
    <Link href="/" className="underline">Home</Link>
    <Link href="/profile" className="underline">Profile</Link>
    <Link href="/dashboard" className="underline">Dashboard</Link>
    {user ? <>
      <form action={signOut}><button className="underline">Sign out</button></form>
    </> : <Link href="/login" className="underline">Sign in with Google</Link>}
  </nav>;
}
