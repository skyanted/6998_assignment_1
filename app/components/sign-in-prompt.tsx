import Link from "next/link";

export default function SignInPrompt({ section }: { section: "Profile" | "Dashboard" }) {
  return <section className="mt-6 rounded-xl border border-gray-300 p-6">
    <p className="mb-5">Please sign in to {section === "Profile" ? "view and edit your profile" : "create and edit your personal introduction card"}.</p>
    <Link href="/login" className="inline-block rounded-lg bg-blue-700 px-5 py-3 text-white">Go to sign in</Link>
  </section>;
}
