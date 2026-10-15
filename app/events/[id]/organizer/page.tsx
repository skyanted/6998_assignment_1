import Link from '@/app/components/loading-link';
import {notFound} from 'next/navigation';
import Shell from '@/app/components/week4-shell';
import Avatar from '@/app/components/avatar';
import {createAuthClient} from '@/lib/supabase/server';
import {TAGS} from '@/lib/week4/types';
type Organizer={name:string;bio:string;occupation:string|null;city:string|null;avatarUrl:string|null;tags:string[]};
export const metadata={title:'Organizer profile | Campus plans'};
export default async function OrganizerPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^\d+$/.test(id)||!Number.isSafeInteger(Number(id)))notFound();
 const db=await createAuthClient('public');const {data,error}=await db.rpc('week4_public_organizer',{eid:Number(id)});
 if(error)return <Shell><p role="alert" className="rounded-2xl border bg-white p-6">This profile could not be loaded. Please try again.</p><Link className="mt-4 inline-block underline" href={`/events/${id}`}>Back to event</Link></Shell>;
 if(!data)notFound();const profile=data as Organizer;
 return <Shell><div className="mx-auto max-w-3xl"><Link href={`/events/${id}`} className="mb-6 inline-block text-sm font-semibold text-slate-500 hover:text-blue-700">← Back to event</Link><section className="overflow-hidden rounded-3xl border border-slate-200 bg-white"><div className="h-24 bg-gradient-to-r from-blue-100 to-indigo-50"/><div className="px-7 pb-8 sm:px-9"><div className="-mt-12 inline-flex rounded-full border-4 border-white bg-white"><Avatar name={profile.name} photoUrl={profile.avatarUrl} size="large"/></div><p className="mt-5 text-xs font-semibold uppercase tracking-widest text-blue-700">Event organizer</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{profile.name}</h1>{profile.occupation&&<p className="mt-2 text-slate-600">{profile.occupation}</p>}{profile.city&&<p className="mt-2 text-sm text-slate-500">{profile.city}</p>}<div className="mt-7 border-t border-slate-100 pt-6"><h2 className="text-lg font-semibold">About</h2><p className="mt-3 whitespace-pre-wrap break-words leading-7 text-slate-600">{profile.bio||'This organizer hasn’t added an introduction yet.'}</p></div>{profile.tags.length>0&&<div className="mt-6 flex flex-wrap gap-2">{profile.tags.map(tag=><span key={tag} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800">{TAGS.find(t=>t.slug===tag)?.label??tag}</span>)}</div>}</div></section></div></Shell>;
}
