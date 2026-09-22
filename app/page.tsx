import type { Metadata } from "next";
import { connection } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "User Profiles | Assignment 2",
};

type Profile = {
  id: number;
  username: string;
  full_name: string;
  role: "student" | "instructor" | "admin";
  city: string | null;
  bio: string | null;
  interests: string[];
  is_active: boolean;
  created_at: string;
};

export default async function Home() {
  await connection();

  let profiles: Profile[] = [];
  let failed = false;

  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, role, city, bio, interests, is_active, created_at",
      )
      .order("id", { ascending: true });

    if (error) throw new Error("Unable to fetch profiles.");
    profiles = data ?? [];
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold">HelloWorld</h1>
      <p className="mt-3 mb-8">Profile data loaded from Supabase.</p>

      {failed ? (
        <p role="alert">Unable to load profiles. Please try again later.</p>
      ) : profiles.length === 0 ? (
        <p>No profiles yet.</p>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {profiles.map((profile) => (
            <li key={profile.id} className="rounded-xl border border-gray-300 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                  <p className="text-sm text-gray-600">@{profile.username}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize">
                  {profile.role}
                </span>
              </div>

              {profile.bio && <p className="mt-4">{profile.bio}</p>}
              {profile.city && <p className="mt-3 text-sm">City: {profile.city}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded bg-blue-50 px-2 py-1 text-sm text-blue-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-xs text-gray-500">
                {profile.is_active ? "Active" : "Inactive"} · Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
