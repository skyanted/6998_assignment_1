"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProfileCard } from "./actions";
import ProfileCard from "@/app/components/profile-card";
import type { CardContent, ProfileCardData } from "@/lib/profile-card";

type Props = {
  card: (CardContent & { updated_at: string }) | null;
  displayName: string;
  avatarUrl: string | null;
};

export default function CardForm({ card, displayName, avatarUrl }: Props) {
  const [state, action, pending] = useActionState(saveProfileCard, { message: "", saved: false });
  const [draft, setDraft] = useState({
    email: card?.email ?? "",
    bio: card?.bio ?? "",
    role: card?.role ?? "",
    city: card?.city ?? "",
    interests: card?.interests.join(", ") ?? "",
    is_active: card?.is_active ?? true,
  });
  function change<K extends keyof typeof draft>(field: K, value: (typeof draft)[K]) {
    setDraft(current => ({ ...current, [field]: value }));
  }
  const tags = [...new Set(draft.interests.split(",").map(value => value.trim()).filter(Boolean))];
  const tagError = tags.length > 3 ? "Use no more than 3 tags."
    : tags.some(value => Array.from(value).length > 20) ? "Each tag must be 20 characters or fewer." : "";
  const preview: ProfileCardData = {
    ...draft,
    email: draft.email.trim().toLowerCase() || null,
    role: draft.role.trim() || null,
    city: draft.city.trim() || null,
    interests: tags,
    display_name: displayName,
    avatar_url: avatarUrl,
    updated_at: card?.updated_at ?? null,
  };

  return <div className="grid items-start gap-6 lg:grid-cols-2">
    <form action={action} className="space-y-5 rounded-xl border border-gray-300 p-6">
      <p className="text-sm">Name and photo: <Link href="/profile" className="underline">edit in Profile</Link>.</p>
      <div>
        <label htmlFor="card-email" className="mb-2 block font-semibold">Email</label>
        <input id="card-email" name="email" type="email" maxLength={254}
          placeholder="e.g. maya@example.com" value={draft.email} onChange={e => change("email", e.target.value)} className="w-full rounded-lg border p-3" />
      </div>
      <div>
        <label htmlFor="card-bio" className="mb-2 block font-semibold">Personal bio</label>
        <textarea id="card-bio" name="bio" required maxLength={5000} rows={6} value={draft.bio}
          onChange={e => change("bio", e.target.value)} className="w-full rounded-lg border p-3" />
      </div>
      <div>
        <label htmlFor="card-role" className="mb-2 block font-semibold">Role / occupation</label>
        <input id="card-role" name="role" maxLength={50} placeholder="e.g. Student" value={draft.role}
          onChange={e => change("role", e.target.value)} className="w-full rounded-lg border p-3" />
      </div>
      <div>
        <label htmlFor="card-city" className="mb-2 block font-semibold">City</label>
        <input id="card-city" name="city" maxLength={100} value={draft.city}
          onChange={e => change("city", e.target.value)} className="w-full rounded-lg border p-3" />
      </div>
      <div>
        <label htmlFor="card-interests" className="mb-2 block font-semibold">Interests</label>
        <input id="card-interests" name="interests" aria-invalid={!!tagError} aria-describedby="card-interests-help" placeholder="e.g. Design, Photography"
          value={draft.interests} onChange={e => change("interests", e.target.value)} className="w-full rounded-lg border p-3" />
        <p id="card-interests-help" className="mt-2 text-sm">Separate tags with commas. Up to 3 tags, 20 characters each.</p>
        {tagError && <p role="alert" className="mt-2 text-sm text-red-600">{tagError}</p>}
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="is_active" checked={draft.is_active} onChange={e => change("is_active", e.target.checked)} />
        Active
      </label>
      <p className="text-sm">Your saved card is visible on Home.</p>
      <button disabled={pending || !!tagError} className="rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50">
        {pending ? "Saving…" : card || state.saved ? "Save changes" : "Create profile card"}
      </button>
      {state.message && <p role={state.saved ? "status" : "alert"}>{state.message}</p>}
      {state.saved && <Link href="/" className="block underline">View on Home</Link>}
    </form>
    <section aria-label="Card preview">
      <h2 className="mb-4 text-xl font-semibold">Card preview</h2>
      <ProfileCard card={preview} />
    </section>
  </div>;
}
