import 'server-only';
import {createAuthClient} from '@/lib/supabase/server';
import type {Member,Event} from './types';
export async function context(){
 const auth=await createAuthClient('public');const db=auth;
 const {data:{user}}=await auth.auth.getUser();
 if(!user)return {db,user:null,profile:null as Member|null};
 const {data,error}=await db.from('week4_profiles').select('*').eq('id',user.id).maybeSingle();
 if(error)throw new Error('Your account data could not be loaded. Please try again.');
 const tags=await db.from('week4_member_interest_tags').select('tag_slug').eq('user_id',user.id);
 return {db,user,profile:data?{...data,tags:(tags.data??[]).map(t=>t.tag_slug)} as Member:null};
}
export async function events(){
 const {db,user}=await context();
 if(!user)return {data:[] as Event[],user:null,now:Date.now()};
 const [rows,members,tags,votes,history]=await Promise.all([
 db.from('week4_events').select('*').order('published_at',{ascending:false}),
 db.from('week4_profiles').select('id,first_name,last_name'),db.from('week4_event_tags').select('*'),
 db.from('week4_votes').select('*').eq('user_id',user.id),db.from('week4_upvote_history').select('event_id').eq('user_id',user.id)]);
 if(rows.error||members.error||tags.error||votes.error||history.error)throw new Error('Activities could not be loaded. Please try again.');
 const data:Event[]=await Promise.all((rows.data??[]).map(async e=>{
 const member=members.data?.find(m=>m.id===e.creator_id);
 const image=e.image_path?imageUrl('week4-event-images',e.image_path):e.cover_id?`/api/week4/cover/${encodeURIComponent(e.cover_id)}`:null;
 return {...e,wasUpvoted:history.data?.some(h=>h.event_id===e.id)??false,creator:member?`${member.first_name??''} ${member.last_name??''}`.trim():'Member',tags:tags.data?.filter(t=>t.event_id===e.id).map(t=>t.tag_slug)??[],imageUrl:image,myVote:votes.data?.find(v=>v.event_id===e.id)?.value??0};
 }));return {data,user,now:Date.now()};
}

export function imageUrl(bucket:string,path:string){return `/api/week4/image?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`;}
