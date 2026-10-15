import Link from '@/app/components/loading-link';
import {notFound} from 'next/navigation';
import {context,events} from '@/lib/week4/data';
import {safeReturnTo} from '@/lib/week4/navigation';
import Shell from '@/app/components/week4-shell';
import EventCard from '@/app/components/week4-event';
import SignInPrompt from '@/app/components/sign-in-prompt';
export default async function Detail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{from?:string}>}){
 const {id}=await params,{from}=await searchParams;
 if(!/^\d+$/.test(id)||!Number.isSafeInteger(Number(id)))notFound();
 const backHref=safeReturnTo(from??'/#activities');
 const back=<Link href={backHref} className="fixed left-5 top-24 z-30 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors md:left-[224px] hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">← Back</Link>;
 const ctx=await context();
 if(!ctx.user)return <Shell section="Activity">{back}<div className="pt-14 md:pl-28 md:pt-0"><div className="mx-auto max-w-2xl"><SignInPrompt section="Activity" returnTo={`/events/${id}?from=${encodeURIComponent(backHref)}`}/></div></div></Shell>;
 const result=await events().catch(()=>null);if(!result)return <Shell section="Activity">{back}<div className="pt-14 md:pl-28 md:pt-0"><div className="mx-auto max-w-2xl"><p role="alert">Events could not be loaded. Please try again.</p></div></div></Shell>;
 const event=result.data.find(e=>String(e.id)===id);if(!event)notFound();
 return <Shell section="Activity">{back}<div className="pt-14 md:pl-28 md:pt-0"><div className="mx-auto max-w-2xl"><EventCard event={event} signedIn={!!result.user} now={result.now} detail returnTo={backHref}/></div></div></Shell>;
}
