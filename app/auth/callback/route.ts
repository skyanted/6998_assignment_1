import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";
import {cookies} from "next/headers";
import {safeReturnTo} from "@/lib/week4/navigation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.schema("public").rpc("week4_profile_save");
        const store=await cookies();
        const destination=safeReturnTo(store.get('week4-return-to')?.value);
        store.delete('week4-return-to');
        return NextResponse.redirect(new URL(destination, url.origin));
      }
    }
  }
  return NextResponse.redirect(new URL("/login?error=callback", url.origin));
}
