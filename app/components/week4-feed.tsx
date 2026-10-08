import Link from 'next/link';
import {events} from '@/lib/week4/data';
import {eventEnd,popularOrder,type Event} from '@/lib/week4/types';
import Shell from './week4-shell';
import EventCard from './week4-event';
function ActivityRow({title,items,now,signedIn,empty}:{title:string;items:Event[];now:number;signedIn:boolean;empty:string}){
 return <section className="mb-10"><h2 className="mb-5 text-2xl font-semibold">{title}</h2>{items.length?<div aria-label={`${title} activities`} tabIndex={0} className="flex snap-x snap-proximity items-start gap-6 overflow-x-auto pb-5 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600">{items.map(e=><div key={e.id} className="w-[min(85vw,360px)] shrink-0 snap-start"><EventCard event={e} signedIn={signedIn} now={now}/></div>)}</div>:<p className="rounded-2xl border border-dashed p-8 text-slate-500">{empty}</p>}</section>;
}
export default async function Feed({previous=false,sort='popular'}:{previous?:boolean;sort?:string}){
 let result:Awaited<ReturnType<typeof events>>|null=null;let error='';
 try{result=await events();}catch(e){error=e instanceof Error?e.message:'Unable to load activities.';}
 const now=result?.now??0,data=result?.data??[],signedIn=!!result?.user;
 if(previous)return <Shell section="Previous / Ongoing"><h1 className="mb-3 text-3xl font-bold">Previous / Ongoing</h1><p className="mb-8 text-slate-500">Follow the activities you supported and see whether organizers will host them.</p>{error?<p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6">{error}</p>:<><ActivityRow title="Upvoted" items={data.filter(e=>e.wasUpvoted)} now={now} signedIn={signedIn} empty="No upvoted activities yet."/><ActivityRow title="All Previous" items={data.filter(e=>eventEnd(e)<=now||e.hosting_status==='cancelled')} now={now} signedIn={signedIn} empty="No previous activities yet."/></>}</Shell>;
 const popular=sort!=='latest';
 const items=data.filter(e=>eventEnd(e)>now&&e.hosting_status!=='cancelled');
 if(popular)items.sort(popularOrder);
 return <Shell section="Home"><div className="mb-8 rounded-3xl bg-blue-950 p-8 text-white sm:p-10"><p className="mb-3 text-xs uppercase tracking-[.2em] text-blue-200">Your next community activity</p><h1 className="text-4xl font-bold tracking-tight">Good plans start here.</h1><p className="mt-4 max-w-xl text-blue-100">Let AI spark an idea. Vote for your favorites. Organizers decide which activities to host.</p><Link href="/dashboard" className="mt-6 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-950">Create a proposal ↗</Link></div>
 <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Community proposals</h2><div className="flex gap-4 text-sm"><Link className={popular?'font-bold underline':''} href="/">Popular</Link><Link className={!popular?'font-bold underline':''} href="/?sort=latest">Latest</Link></div></div>
 {error?<p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6">{error}</p>:items.length?<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((e,i)=><EventCard key={e.id} event={e} signedIn={signedIn} now={now} rank={popular&&i<3?i+1:undefined}/>)}</div>:<div className="rounded-2xl border border-dashed p-12 text-center"><h3 className="text-xl font-semibold">No proposals yet.</h3></div>}
 </Shell>;
}
