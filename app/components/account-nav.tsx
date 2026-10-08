import Link from 'next/link';
import {createAuthClient} from '@/lib/supabase/server';
import {signOut} from '@/app/auth/actions';
export default async function AccountNav(){
 const supabase=await createAuthClient();const {data:{user}}=await supabase.auth.getUser();
 return <nav aria-label="Account" className="mb-9 flex flex-wrap items-center gap-x-5 gap-y-3 border-b pb-5 text-sm font-medium">
 { [['/','Home'],['/previous','Previous / Ongoing'],['/dashboard','Create / Mine'],['/members','Members'],['/profile','Profile']].map(([url,label])=><Link key={url} href={url} className="hover:text-blue-700">{label}</Link>)}
 {user?<form action={signOut} className="ml-auto"><button className="text-slate-500">Sign out</button></form>:<Link href="/login" className="ml-auto rounded-full bg-blue-700 px-4 py-2 text-white">Sign in with Google</Link>}
 </nav>;
}
