import Link from 'next/link';
import AccountNav from './account-nav';
import {createAuthClient} from '@/lib/supabase/server';
import SignInPrompt,{type Section} from './sign-in-prompt';

export default async function Shell({children,section='Home'}:{children:React.ReactNode;section?:Section}){
 const db=await createAuthClient('public');const {data:{user}}=await db.auth.getUser();
 return <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8"><div className="mb-6 flex items-center gap-3"><Link href="/" className="text-lg font-bold tracking-tight">Campus plans<span className="text-blue-600">.</span></Link><span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-800">Columbia community</span></div><AccountNav/>{user?children:<><h1 className="text-3xl font-bold">{section}</h1><SignInPrompt section={section}/></>}{user&&<footer className="mt-16 border-t pt-6 text-sm text-slate-500">Made for new friends and shared experiences. Activities are AI-generated proposals, not confirmed bookings.</footer>}</main>;
}
