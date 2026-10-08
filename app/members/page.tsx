import Shell from '@/app/components/week4-shell';
import Avatar from '@/app/components/avatar';
import {context,imageUrl} from '@/lib/week4/data';
import {TAGS,type Member} from '@/lib/week4/types';
async function load(){
 const {db,user}=await context();if(!user)return {db,members:[] as Member[]};const [profiles,tags]=await Promise.all([db.from('week4_profiles').select('*').eq('published',true).order('created_at'),db.from('week4_member_interest_tags').select('*')]);if(profiles.error||tags.error)throw new Error('Members unavailable');
 return {db,members:(profiles.data??[]).map(p=>({...p,tags:tags.data?.filter(t=>t.user_id===p.id).map(t=>t.tag_slug)??[]})) as Member[]};
}
export default async function Members(){
 const result=await load().catch(()=>null);
 return <Shell section="Members"><h1 className="text-3xl font-bold">Meet the community</h1><p className="mb-8 mt-3 text-slate-500">New friends, shared interests, and people to explore New York with.</p>
 {!result?<p role="alert">Members could not be loaded. Please try again.</p>:result.members.length?<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.members.map(m=>{const name=`${m.first_name} ${m.last_name}`;return <article key={m.id} className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-4"><Avatar name={name} photoUrl={m.avatar_path?imageUrl('week4-avatars',m.avatar_path):null}/><h2 className="text-xl font-bold">{name}</h2></div><p className="mt-4 break-words text-sm text-slate-500">{m.email}</p><p className="mt-3 whitespace-pre-wrap">{m.bio}</p><p className="mt-4 text-sm">{[m.occupation,m.city].filter(Boolean).join(' · ')}</p><div className="mt-4 flex flex-wrap gap-2">{m.tags?.map(t=><span key={t} className="rounded-md bg-blue-50 px-2 py-1 text-xs">{TAGS.find(x=>x.slug===t)?.label}</span>)}</div></article>;})}</div>:<p className="rounded-2xl border border-dashed p-10">No member cards yet. Save your Profile to introduce yourself.</p>}
 </Shell>;
}
