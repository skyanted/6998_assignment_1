import Link from '@/app/components/loading-link';
import Shell from '@/app/components/week4-shell';
import SignInPrompt from '@/app/components/sign-in-prompt';
import EventCard from '@/app/components/week4-event';
import {context,events} from '@/lib/week4/data';
import HostingForm from '@/app/dashboard/hosting-form';
import ProfileForm from '@/app/profile/profile-form';
import {eventEnd} from '@/lib/week4/types';
export default async function Mine({searchParams}:{searchParams:Promise<{tab?:string}>}){
 const {tab}=await searchParams,active=tab==='profile'?'profile':tab==='upvoted'?'upvoted':'activities';
 const tabs=(<nav aria-label="Your content" className="mb-8 inline-flex max-w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 text-sm font-semibold">{[['activities','Published events'],['upvoted','Upvoted events'],['profile','Personal profile']].map(([key,label])=><Link key={key} href={key==='activities'?'/mine':`/mine?tab=${key}`} aria-current={active===key?'page':undefined} className={`rounded-xl border px-5 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active===key?'border-blue-700 bg-blue-700 text-white shadow-sm':'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}`}>{label}</Link>)}</nav>);
 const returnTo=active==='activities'?'/mine':`/mine?tab=${active}`;
 const ctx=await context();if(!ctx.user)return <Shell section="Mine"><h1 className="mb-7 text-3xl font-bold">Mine</h1>{tabs}<SignInPrompt section="Mine" returnTo={returnTo}/></Shell>;
 const {user,profile}=ctx;
 const result=active==='profile'?null:await events();
 const items=result?.data.filter(e=>active==='upvoted'?e.wasUpvoted:e.creator_id===user.id)??[];
 const data=profile??{id:user.id,first_name:null,last_name:null,email:null,bio:'',occupation:null,city:null,avatar_path:null,published:false,tags:[]};
 return <Shell section="Mine"><div className="mb-7 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Mine</h1></div></div>
 {tabs}
 {active==='profile'?<ProfileForm profile={data}/>:<><p className="mb-6 text-sm text-slate-500">{active==='upvoted'?'Follow events you’ve upvoted and see whether the creator has confirmed hosting.':'See how much interest your events get, then decide whether to host.'}</p>{items.length?<div className="activity-layout"><div className="activity-grid">{items.map(e=><div key={e.id}><EventCard event={e} signedIn now={result!.now} returnTo={active==='upvoted'?'/mine?tab=upvoted':'/mine'}/>{active==='activities'&&eventEnd(e)>result!.now&&<HostingForm id={e.id} details={e.hosting_details} status={e.hosting_status}/>}</div>)}</div></div>:<div className="rounded-2xl border border-dashed bg-white p-10 text-center"><h2 className="text-lg font-semibold">{active==='upvoted'?'No upvoted events yet.':'No published events yet.'}</h2><Link href={active==='upvoted'?'/':'/create'} className="mt-4 inline-block text-sm font-semibold text-blue-700">{active==='upvoted'?'Explore events →':'Create your first event →'}</Link></div>}</>}
 </Shell>;
}
