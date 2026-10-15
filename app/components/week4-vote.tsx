'use client';
import Link from '@/app/components/loading-link';
import {useActionState} from 'react';
import {loginHref} from '@/lib/week4/navigation';
import {vote} from '@/app/week4/actions';
export default function Vote({id,up,down,mine,closed,signedIn,compact=false}:{id:number;up:number;down:number;mine:number;closed:boolean;signedIn:boolean;compact?:boolean}){
 const [state,action,pending]=useActionState(vote,{message:'',ok:false});
 if(closed)return <div className="flex gap-4 text-sm"><span>↑ {up} upvotes</span><span>↓ {down} downvotes</span><span className="text-slate-500">Final</span></div>;
 if(!signedIn)return <div id={`vote-${id}`}><div className="flex gap-2">{[['↑',up,'Upvote'],['↓',down,'Downvote']].map(([arrow,count,label])=><Link key={label} href={loginHref(`/events/${id}#vote-${id}`,'vote')} aria-label={`${label}: sign in to vote`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-blue-50">{arrow} {count}</Link>)}</div>{!compact&&<p className="mt-2 text-xs text-slate-400">Sign in to vote on this event.</p>}</div>;
 return <form id={`vote-${id}`} action={action}><input type="hidden" name="event_id" value={id}/><div className="flex gap-2">
 <button name="value" value={mine===1?0:1} disabled={pending} aria-pressed={mine===1} aria-label={mine===1?'Remove upvote':'Upvote'} className={`rounded-full border px-4 py-2 text-sm ${mine===1?'bg-blue-700 text-white':'bg-white'}`}>↑ {up}</button>
 <button name="value" value={mine===-1?0:-1} disabled={pending} aria-pressed={mine===-1} aria-label={mine===-1?'Remove downvote':'Downvote'} className={`rounded-full border px-4 py-2 text-sm ${mine===-1?'bg-slate-800 text-white':'bg-white'}`}>↓ {down}</button></div>{state.message&&<p role={state.ok?'status':'alert'} className="mt-2 text-xs">{state.message}</p>}</form>;
}
