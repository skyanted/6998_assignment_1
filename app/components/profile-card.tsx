import Avatar from "./avatar";
import type { ProfileCardData } from "@/lib/profile-card";

export default function ProfileCard({ card }: { card: ProfileCardData }) {
  return <article className="h-full rounded-xl border border-gray-300 p-6">
    <div className="flex items-center gap-4">
      <Avatar name={card.display_name} photoUrl={card.avatar_url} />
      <h2 className="min-w-0 break-words text-xl font-semibold">{card.display_name}</h2>
      {card.role && <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 capitalize">{card.role}</span>}
    </div>
    {card.email && <p className="mt-3 break-words text-sm text-gray-600">{card.email}</p>}
    <p className="mt-3 whitespace-pre-wrap break-words">{card.bio}</p>
    {card.city && <p className="mt-3 text-sm">City: {card.city}</p>}
    {card.interests.length > 0 && <div className="mt-4 flex flex-wrap gap-2">
      {card.interests.map(interest => <span key={interest} className="rounded bg-blue-50 px-2 py-1 text-sm text-blue-800">{interest}</span>)}
    </div>}
    <p className="mt-5 text-xs text-gray-500">
      {card.is_active ? "Active" : "Inactive"}
      {card.updated_at && <> · {card.dateLabel ?? "Updated"} <time dateTime={card.updated_at}>{new Date(card.updated_at).toLocaleDateString("en-US", { timeZone: "UTC" })}</time></>}
    </p>
  </article>;
}
