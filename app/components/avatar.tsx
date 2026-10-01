type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: "small" | "large";
};

export default function Avatar({ name, photoUrl, size = "small" }: AvatarProps) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? `${Array.from(words[0])[0]}${Array.from(words[words.length - 1])[0]}`.toUpperCase()
    : (Array.from(words[0] ?? "?")[0]).toUpperCase();
  const dimensions = size === "large" ? "h-28 w-28 text-3xl" : "h-16 w-16 text-xl";

  if (photoUrl) {
    // Profile photos are hosted in Supabase Storage.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={`${name.trim() || "Your"} profile photo`} className={`${dimensions} shrink-0 rounded-full object-cover`} />;
  }

  return <span role="img" aria-label={`${name.trim() || "Profile"} initials avatar`}
    className={`${dimensions} inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-800`}>
    {initials}
  </span>;
}
