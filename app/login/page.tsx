import Link from "next/link";
import GoogleLogin from "./google-login";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="mx-auto w-full max-w-xl px-6 py-12">
    <Link href="/" className="underline">Home</Link>
    <h1 className="mt-8 text-3xl font-bold">Sign in</h1>
    <p className="my-6">Sign in with Google to manage your profile and access the dashboard.</p>
    {error && <p role="alert" className="mb-6">Sign-in could not be completed. Please try again.</p>}
    <GoogleLogin />
  </main>;
}
