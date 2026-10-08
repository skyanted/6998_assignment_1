import Link from 'next/link';
import Shell from '@/app/components/week4-shell';
import SignInPrompt from '@/app/components/sign-in-prompt';
import EventCard from '@/app/components/week4-event';
import {context,events,imageUrl} from '@/lib/week4/data';
import Generator from './generator';
import HostingForm from './hosting-form';
import Draft from './saved-draft';
import {eventEnd} from '@/lib/week4/types';
export default async function Dashboard(){
 const ctx=await context().catch(()=>null);
 if(!ctx)return <Shell section="Create / Mine"><h1 className="text-3xl font-bold">Create / Mine</h1><p role="alert" className="mt-6">Your account data could not be loaded. Please try again.</p></Shell>;
 const {db,user,profile}=ctx;
 if(!user)return <Shell section="Create / Mine"><h1 className="text-3xl font-bold">Create / Mine</h1><SignInPrompt section="Create / Mine"/></Shell>;
 if(!profile?.published)return <Shell section="Create / Mine"><h1 className="text-3xl font-bold">Create / Mine</h1><p className="my-6">Add your name and save your Profile before generating activities.</p><Link href="/profile" className="rounded-full bg-blue-700 px-5 py-3 text-white">Complete Profile</Link></Shell>;
 const result=await events().catch(()=>null);
 if(!result)return <Shell section="Create / Mine"><p role="alert">Your activities could not be loaded.</p></Shell>;
 const mine=result.data.filter(e=>e.creator_id===user.id);
 const drafts=await db.from('week4_ai_generations').select('id,output,status,created_at,image_path').eq('user_id',user.id).eq('status','ready').order('created_at',{ascending:false}).limit(10);
 const unpublished=(drafts.data??[]).filter(g=>!mine.some(e=>e.generation_id===g.id));
 return <Shell section="Create / Mine"><h1 className="mb-3 text-3xl font-bold">Create / Mine</h1><p className="mb-8 text-slate-500">Propose something worth leaving the dorm for. Member card edits live in Profile.</p><div className="mx-auto max-w-3xl"><Generator key={mine[0]?.generation_id??'new'} enabled={!!process.env.GEMINI_API_KEY}/>{unpublished.length>0&&<section className="mt-8"><h2 className="mb-4 text-xl font-bold">Saved drafts</h2>{unpublished.map(g=><Draft key={g.id} draft={{...g,imageUrl:g.image_path?imageUrl('week4-event-images',g.image_path):g.output?.cover_id?`/api/week4/cover/${encodeURIComponent(g.output.cover_id)}`:null}} now={result.now}/>)}</section>}</div>
 <h2 className="mb-5 mt-12 text-2xl font-bold">Your proposals</h2>{mine.length?<div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">{mine.map(e=><div key={e.id}><EventCard event={e} signedIn now={result.now}/>{eventEnd(e)>result.now&&<HostingForm id={e.id} details={e.hosting_details} status={e.hosting_status}/>}</div>)}</div>:<p className="rounded-xl border border-dashed p-8 text-slate-500">Your first published activity will appear here.</p>}
 </Shell>;
}
