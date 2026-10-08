'use client';
import {useActionState} from 'react';
import {confirm} from '@/app/week4/actions';
export default function HostingForm({id,details,status}:{id:number;details:string|null;status:string}){
 const [state,action,pending]=useActionState(confirm,{message:'',ok:false});
 return <form action={action} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5"><input type="hidden" name="event_id" value={id}/>
 <label className="block text-sm font-semibold">Hosting details<textarea name="details" defaultValue={details??''} required maxLength={3000} rows={3} placeholder="Meeting point, arrangements or an online meeting link…" className="mt-2 w-full rounded-lg border bg-white p-3"/></label>
 <div className="flex flex-wrap gap-3"><button name="decision" value="confirmed" disabled={pending} className="rounded-full bg-green-800 px-5 py-2 text-sm text-white">{pending?'Saving…':status==='confirmed'?'Save hosting details':'Confirm I will host'}</button>
 {status!=='cancelled'&&<button name="decision" value="cancelled" formNoValidate disabled={pending} className="rounded-full border border-red-200 px-5 py-2 text-sm text-red-700">Cancel activity</button>}</div>
 {state.message&&<p role={state.ok?'status':'alert'} className="text-sm">{state.message}</p>}</form>;
}
