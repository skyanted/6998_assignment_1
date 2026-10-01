"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/browser";
import Avatar from "@/app/components/avatar";

type Profile = { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null };
const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last || first.length > 100 || last.length > 100) {
      setMessage("Enter your first and last name (up to 100 characters each).");
      return;
    }
    if (photo && (!imageTypes.includes(photo.type) || photo.size > 5 * 1024 * 1024)) {
      setMessage("Choose a JPEG, PNG, or WebP photo up to 5 MB.");
      return;
    }
    setPending(true);
    const supabase = createAuthBrowserClient();
    let uploadedPath: string | null = null;
    let saved = false;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || user.id !== profile.id) {
        router.replace("/login");
        return;
      }
      let nextAvatar = avatarUrl;
      if (photo) {
        // A fresh path avoids showing a cached old photo after replacement.
        const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[photo.type];
        uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("avatars").upload(uploadedPath, photo, { contentType: photo.type });
        if (error) throw new Error("Photo upload failed. Check the avatars bucket and try again.");
        nextAvatar = supabase.storage.from("avatars").getPublicUrl(uploadedPath).data.publicUrl;
      }
      const { data, error } = await supabase.from("profiles")
        .update({ first_name: first, last_name: last, avatar_url: nextAvatar })
        .eq("id", user.id).select("id").single();
      if (error || !data) throw new Error("Profile could not be saved. Please try again.");
      saved = true;
      if (uploadedPath && avatarUrl) {
        const prefix = supabase.storage.from("avatars").getPublicUrl("").data.publicUrl;
        if (avatarUrl.startsWith(prefix)) {
          const oldPath = avatarUrl.slice(prefix.length);
          if (oldPath.startsWith(`${user.id}/`)) await supabase.storage.from("avatars").remove([oldPath]);
        }
      }
      setAvatarUrl(nextAvatar);
      setPhoto(null);
      if (photoInput.current) photoInput.current.value = "";
      setMessage("Profile saved.");
      router.refresh();
    } catch (error) {
      if (uploadedPath && !saved) await supabase.storage.from("avatars").remove([uploadedPath]);
      setMessage(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={save} className="space-y-5">
    <Avatar name={`${firstName} ${lastName}`} photoUrl={avatarUrl} size="large" />
    <div><label htmlFor="first-name" className="mb-2 block">First name</label>
      <input id="first-name" autoComplete="given-name" required maxLength={100} value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full rounded-lg border p-3" /></div>
    <div><label htmlFor="last-name" className="mb-2 block">Last name</label>
      <input id="last-name" autoComplete="family-name" required maxLength={100} value={lastName} onChange={e => setLastName(e.target.value)} className="w-full rounded-lg border p-3" /></div>
    <div><label htmlFor="photo" className="mb-2 block">Profile photo</label>
      <input ref={photoInput} id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
      <p className="mt-2 text-sm">JPEG, PNG, or WebP, up to 5 MB. A new upload replaces your current photo.</p></div>
    <button disabled={pending} className="rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50">{pending ? "Saving…" : "Save profile"}</button>
    {message && <p role="status">{message}</p>}
    {message === "Profile saved." && <Link href="/dashboard" className="block underline">Continue to dashboard</Link>}
  </form>;
}
