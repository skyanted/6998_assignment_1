import Link from '@/app/components/loading-link';
import AccountNav from './account-nav';
import ProfileReminder from './profile-reminder';
import {context,imageUrl} from '@/lib/week4/data';
import {signOut} from '@/app/auth/actions';
import type {Section} from './sign-in-prompt';
export default async function Shell({children}:{children:React.ReactNode;section?:Section}){
 const ctx=await context().catch(()=>null),user=ctx?.user,profile=ctx?.profile;
 const name=`${profile?.first_name??''} ${profile?.last_name??''}`.trim();
 const nav=<AccountNav signedIn={!!user} name={name} avatar={profile?.avatar_path?imageUrl('week4-avatars',profile.avatar_path):null}/>;
 return <div className="min-h-screen"><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">Skip to content</a>
 <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5 md:px-8"><Link href="/" className="flex items-center gap-2 text-base font-bold sm:text-xl tracking-tight text-slate-900"><span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">c<span className="text-blue-200">.</span></span><span className="whitespace-nowrap">Campus plans<span className="text-blue-600">.</span></span></Link><div className="flex items-center gap-2 sm:gap-4">{user?<form action={signOut}><button className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500 hover:bg-slate-50">Sign out</button></form>:<Link href="/login" className="rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm text-white hover:bg-blue-800">Sign in</Link>}<details className="relative md:hidden"><summary aria-label="Open navigation menu" className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 p-2 [&::-webkit-details-marker]:hidden"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span className="sr-only">Menu</span></summary><div className="absolute right-0 top-12 w-48 rounded-2xl border bg-white p-3 shadow-lg">{nav}</div></details></div></header>
 <aside className="fixed bottom-0 left-0 top-[72px] hidden w-[200px] flex-col border-r border-slate-200 bg-white px-4 py-7 md:flex">{nav}</aside>
 <div className="pt-[72px] md:pl-[200px]"><main id="main-content" className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{user&&(!profile?.first_name||!profile?.last_name)&&<ProfileReminder/>}{children}</main></div></div>;
}
