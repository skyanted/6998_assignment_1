'use server';
import {revalidatePath} from 'next/cache';
import {context} from '@/lib/week4/data';
import {nyToISO} from '@/lib/week4/types';
export type ActionState={message:string;ok:boolean;eventId?:number};
export async function publish(_state:ActionState,form:FormData):Promise<ActionState>{
 try{const {db,user}=await context();if(!user)throw new Error('Sign in to publish.');
 const gid=Number(form.get('generation_id'));if(!Number.isSafeInteger(gid)||gid<1)throw new Error('Choose a generated event proposal.');
 const starts=nyToISO(String(form.get('starts_at')));
 const first=String(form.get('first_name')??'').trim(),last=String(form.get('last_name')??'').trim();
 const profile=await db.from('week4_profiles').select('*').eq('id',user.id).maybeSingle();if(profile.error)throw new Error('Your name could not be checked. Please try again.');
 if(!profile.data?.first_name||!profile.data?.last_name){if(!first||!last||first.length>100||last.length>100)throw new Error('Add your first and last name before publishing.');
 const tags=await db.from('week4_member_interest_tags').select('tag_slug').eq('user_id',user.id);if(tags.error)throw new Error('Your profile could not be loaded.');
 const saved=await db.rpc('week4_profile_save',{details:{...profile.data,first_name:first,last_name:last},selected_tags:(tags.data??[]).map(t=>t.tag_slug)});if(saved.error)throw new Error(saved.error.message);}
 const {data:eventId,error}=await db.rpc('week4_publish',{gid,event_time:starts});if(error)throw new Error(error.message);
 revalidatePath('/');revalidatePath('/dashboard');revalidatePath('/previous');revalidatePath('/create');revalidatePath('/mine');return {message:'Published! Your event is now on Home. Your other drafts have been discarded.',ok:true,eventId};
 }catch(e){return {message:e instanceof Error?e.message:'Unable to publish.',ok:false};}
}
export async function vote(_state:ActionState,form:FormData):Promise<ActionState>{
 try{const {db,user}=await context();if(!user)throw new Error('Sign in to vote.');
 const eid=Number(form.get('event_id')),v=Number(form.get('value'));if(!Number.isSafeInteger(eid)||eid<1||![-1,0,1].includes(v))throw new Error('Invalid vote.');
 const {error}=await db.rpc('week4_vote',{eid,v});if(error)throw new Error(error.message);
 revalidatePath('/');revalidatePath(`/events/${eid}`);revalidatePath('/previous');revalidatePath('/mine');return {message:v===0?'Vote removed.':'Vote saved.',ok:true};
 }catch(e){return {message:e instanceof Error?e.message:'Unable to vote.',ok:false};}
}
export async function confirm(_state:ActionState,form:FormData):Promise<ActionState>{
 try{const {db,user}=await context();if(!user)throw new Error('Sign in first.');
 const eid=Number(form.get('event_id')),details=String(form.get('details')??''),decision=String(form.get('decision'));if(!Number.isSafeInteger(eid)||eid<1||!['confirmed','cancelled'].includes(decision)||(decision==='confirmed'&&!details.trim())||details.length>3000)throw new Error('Add hosting details, up to 3,000 characters.');
 const {error}=await db.rpc('week4_set_hosting',{eid,decision,details});if(error)throw new Error(error.message);
 revalidatePath('/');revalidatePath('/dashboard');revalidatePath(`/events/${eid}`);revalidatePath('/previous');revalidatePath('/mine');return {message:decision==='confirmed'?'Hosting confirmed. Your hosting details are visible.':'Event cancelled.',ok:true};
 }catch(e){return {message:e instanceof Error?e.message:'Unable to confirm.',ok:false};}
}
