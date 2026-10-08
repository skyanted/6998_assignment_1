'use server';
import {revalidatePath} from 'next/cache';
import {context} from '@/lib/week4/data';
import {nyToISO} from '@/lib/week4/types';
export type ActionState={message:string;ok:boolean};
export async function publish(_state:ActionState,form:FormData):Promise<ActionState>{
 try{const {db,user}=await context();if(!user)throw new Error('Sign in to publish.');
 const gid=Number(form.get('generation_id'));if(!Number.isSafeInteger(gid)||gid<1)throw new Error('Choose a generated activity.');
 const starts=nyToISO(String(form.get('starts_at')));
 const {error}=await db.rpc('week4_publish',{gid,event_time:starts});if(error)throw new Error(error.message);
 const discarded=await db.from('week4_ai_generations').select('image_path').eq('user_id',user.id).eq('status','discarded').not('image_path','is',null);
 const paths=(discarded.data??[]).map(d=>d.image_path as string);
 if(paths.length)await db.storage.from('week4-event-images').remove(paths);
 revalidatePath('/');revalidatePath('/dashboard');revalidatePath('/previous');return {message:'Published! Your other drafts have been discarded.',ok:true};
 }catch(e){return {message:e instanceof Error?e.message:'Unable to publish.',ok:false};}
}
export async function vote(_state:ActionState,form:FormData):Promise<ActionState>{
 try{const {db,user}=await context();if(!user)throw new Error('Sign in to vote.');
 const eid=Number(form.get('event_id')),v=Number(form.get('value'));if(!Number.isSafeInteger(eid)||eid<1||![-1,0,1].includes(v))throw new Error('Invalid vote.');
 const {error}=await db.rpc('week4_vote',{eid,v});if(error)throw new Error(error.message);
 revalidatePath('/');revalidatePath(`/events/${eid}`);revalidatePath('/previous');return {message:v===0?'Vote removed.':'Vote saved.',ok:true};
 }catch(e){return {message:e instanceof Error?e.message:'Unable to vote.',ok:false};}
}
export async function confirm(_state:ActionState,form:FormData):Promise<ActionState>{
 try{const {db,user}=await context();if(!user)throw new Error('Sign in first.');
 const eid=Number(form.get('event_id')),details=String(form.get('details')??''),decision=String(form.get('decision'));if(!Number.isSafeInteger(eid)||eid<1||!['confirmed','cancelled'].includes(decision)||(decision==='confirmed'&&!details.trim())||details.length>3000)throw new Error('Add hosting details, up to 3,000 characters.');
 const {error}=await db.rpc('week4_set_hosting',{eid,decision,details});if(error)throw new Error(error.message);
 revalidatePath('/');revalidatePath('/dashboard');revalidatePath(`/events/${eid}`);revalidatePath('/previous');return {message:decision==='confirmed'?'Activity confirmed. Your hosting details are visible.':'Activity cancelled.',ok:true};
 }catch(e){return {message:e instanceof Error?e.message:'Unable to confirm.',ok:false};}
}
