'use client';
import {useActionState} from 'react';
import {publish} from '@/app/week4/actions';
import {nyInput} from '@/lib/week4/types';
export default function PublishForm({id,time,minimumStart}:{id:number;time:string;minimumStart:string}){
 const [state,action,pending]=useActionState(publish,{message:'',ok:false});
 return <form action={action} className="space-y-4"><input type="hidden" name="generation_id" value={id}/><label className="block text-sm font-semibold">Date and start time (New York)<input type="datetime-local" name="starts_at" required defaultValue={nyInput(time)} min={nyInput(minimumStart)} className="mt-2 block rounded-lg border p-3"/></label><button disabled={pending||state.ok} className="rounded-full bg-slate-900 px-6 py-3 text-white disabled:opacity-50">{pending?'Publishing…':state.ok?'Published':'Publish proposal'}</button>{state.message&&<p role={state.ok?'status':'alert'} className="text-sm">{state.message}</p>}</form>;
}
