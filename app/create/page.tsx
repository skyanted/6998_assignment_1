import Shell from '@/app/components/week4-shell';
import Link from '@/app/components/loading-link';
import {loginHref} from '@/lib/week4/navigation';
import CreateWorkspace from './create-workspace';
import {context} from '@/lib/week4/data';
import Generator from '@/app/dashboard/generator';
import Draft from '@/app/dashboard/saved-draft';
import type {Generation} from '@/lib/week4/types';
export default async function Create({searchParams}:{searchParams:Promise<{tab?:string}>}){
 const {tab}=await searchParams;
 const ctx=await context(),now=ctx.now;let unpublished:Generation[]=[];
 if(ctx.user){const [drafts,used]=await Promise.all([ctx.db.from('week4_ai_generations').select('id,output,status,created_at,image_path').eq('status','ready').order('created_at',{ascending:false}).limit(10),ctx.db.from('week4_events').select('generation_id').eq('creator_id',ctx.user.id)]);if(drafts.error||used.error)throw new Error('Saved drafts could not be loaded.');unpublished=(drafts.data??[]).filter(g=>!used.data?.some(e=>e.generation_id===g.id));}
 const savedDrafts=<section><h2 className="mb-2 text-2xl font-bold">Your drafts</h2>{!ctx.user?<div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-600">Sign in to view your drafts.</p><Link href={loginHref('/create?tab=drafts')} className="mt-4 inline-block rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link></div>:unpublished.length>0?<><p className="mb-5 text-sm text-slate-500">Only you can see these. Publishing one discards your other unpublished drafts.</p>{unpublished.map(g=><Draft key={g.id} draft={{...g,imageUrl:g.image_path?`/api/week4/image?bucket=week4-event-images&path=${encodeURIComponent(g.image_path)}`:g.output?.cover_id?`/api/week4/cover/${encodeURIComponent(g.output.cover_id)}`:null}} now={now} needsName={!ctx.profile?.first_name||!ctx.profile?.last_name}/>)}</>:<p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No saved drafts yet.</p>}</section>;
 return <Shell section="Create"><div className="mx-auto max-w-3xl"><CreateWorkspace initialTab={tab==='drafts'?'drafts':'create'} count={unpublished.length} signedIn={!!ctx.user} drafts={savedDrafts}><div className="mb-7"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Turn an idea into an event.</h1><p className="mt-3 leading-7 text-slate-500">One sentence or one photo is enough. AI plans what to do, where, and when.</p></div><Generator enabled={!!process.env.GEMINI_API_KEY} signedIn={!!ctx.user} needsName={!ctx.profile?.first_name||!ctx.profile?.last_name}/></CreateWorkspace></div></Shell>;
}
