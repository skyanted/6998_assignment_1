"use client";

import { useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/browser";

export default function GoogleLogin() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function login() {
    setPending(true);
    setError("");
    try {
      const { error } = await createAuthBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setError("Unable to start Google sign-in. Please try again.");
      setPending(false);
    }
  }
  return <div>
    <button className="rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50" onClick={login} disabled={pending}>
      {pending ? "Redirecting…" : "Sign in with Google"}
    </button>
    {error && <p role="alert" className="mt-4">{error}</p>}
  </div>;
}
