'use client';
import {useTransition,type FormEvent,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import Link from './loading-link';
import {Spinner} from './loading-indicator';
export default function EventFilterForm({children,resetHref}:{children:ReactNode;resetHref:string}){
 const router=useRouter();const [pending,startTransition]=useTransition();
 function apply(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const query=new URLSearchParams();
  new FormData(event.currentTarget).forEach((value,key)=>{if(typeof value==='string'&&value)query.set(key,value);});
  const current=new URLSearchParams(window.location.search);
  const keys=['view','sort','host','format','tag'];
  if(keys.every(key=>(current.get(key)||'')===(query.get(key)||'')))return;
  startTransition(()=>router.push('/'+(query.size?'?'+query.toString():'')+'#activities',{scroll:false}));
 }
 return <form action="/#activities" method="get" onSubmit={apply} aria-busy={pending} className="absolute right-0 top-11 z-30 w-64 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-xl">{children}<div className="flex items-center justify-between"><Link href={resetHref} className="text-slate-500 hover:text-slate-900">Reset</Link><button disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 font-semibold text-white">Apply{pending&&<span className="navigation-loading inline-flex"><Spinner className="h-4 w-4"/></span>}</button></div></form>;
}
