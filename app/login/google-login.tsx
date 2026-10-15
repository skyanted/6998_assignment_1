"use client";
import {Spinner} from '@/app/components/loading-indicator';

import { useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/browser";

export default function GoogleLogin({next="/"}:{next?:string}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function login() {
    setPending(true);
    setError("");
    try {
      const saved=await fetch('/auth/return',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({next})});
      if(!saved.ok)throw new Error('Unable to save your return location.');
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
    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50" onClick={login} disabled={pending}>
      {pending ? "Redirecting…" : "Sign in with Google"}{pending&&<Spinner className="h-4 w-4"/>}
    </button>
    {error && <p role="alert" className="mt-4">{error}</p>}
  </div>;
}
