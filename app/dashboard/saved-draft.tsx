'use client';
import {useActionState} from 'react';
import {publish} from '@/app/week4/actions';
import PlanDetails from '@/app/components/week4-plan';
import {nyInput,type Generation} from '@/lib/week4/types';
export default function Draft({draft,now}:{draft:Generation & {imageUrl:string|null};now:number}){
 const [state,action,pending]=useActionState(publish,{message:'',ok:false});
 if(!draft.output)return null;
 return <details className="mb-4 rounded-xl border bg-white p-5"><summary className="cursor-pointer font-semibold">{draft.output.title}</summary><div className="my-5"><PlanDetails plan={draft.output} imageUrl={draft.imageUrl}/></div><p className="mb-4 text-sm">Choose a future start time before publishing.</p><form action={action} className="space-y-3"><input type="hidden" name="generation_id" value={draft.id}/><label className="block text-sm">Start time (New York)<input type="datetime-local" name="starts_at" defaultValue={nyInput(draft.output.starts_at)} min={nyInput(new Date(now).toISOString())} required className="mt-2 block rounded border p-2"/></label><button disabled={pending||state.ok} className="rounded-full bg-blue-700 px-4 py-2 text-sm text-white">{pending?'Publishing…':state.ok?'Published':'Publish'}</button>{state.message&&<p role={state.ok?'status':'alert'} className="text-sm">{state.message}</p>}</form></details>;
}
