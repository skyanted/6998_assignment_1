/* eslint-disable @next/next/no-img-element -- Covers are served by our image routes. */
import Link from '@/app/components/loading-link';
import type {Event} from '@/lib/week4/types';
import {nyDate,TAGS,eventEnd,eventPhase} from '@/lib/week4/types';
import Vote from './week4-vote';
export default function EventCard({event:e,signedIn,now,detail=false,rank,returnTo='/#activities'}:{event:Event;signedIn:boolean;now:number;detail?:boolean;rank?:number;returnTo?:string}){
 const eventHref=`/events/${e.id}?from=${encodeURIComponent(returnTo)}`;
 const phase=eventPhase(e,now),closed=eventEnd(e)<=now||e.hosting_status==='cancelled';
 const venue=e.format==='online'?'Online':e.location.split(',')[0];
 const hostConfirmed=e.hosting_status==='confirmed';
 return <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
 {e.imageUrl?<Link href={eventHref} tabIndex={detail?-1:0} aria-label={`View details for ${e.title}`}><img src={e.imageUrl} alt={`Cover for ${e.title}`} className={`${detail?'aspect-video':'aspect-[2/1]'} w-full object-cover transition-opacity hover:opacity-90`}/></Link>:<div className={`${detail?'aspect-video':'aspect-[2/1]'} bg-gradient-to-br from-blue-100 via-indigo-100 to-amber-50`}/>}
 {hostConfirmed&&<div className="flex items-center gap-3 border-y border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950"><span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">✓</span><p className="text-sm font-bold">Hosting confirmed</p></div>}
 {hostConfirmed&&!detail&&<p className="border-b border-emerald-100 bg-emerald-50/40 px-4 py-2 text-[11px] text-emerald-800"><Link href={eventHref} className="hover:underline underline-offset-2">Open Details for hosting information →</Link></p>}
 <div className={detail?'p-5':'p-4'}>
 <div className="mb-3 flex items-center justify-between gap-2 text-xs">{rank?<span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-900">Popular #{rank}</span>:<span/>}<span className={phase==='Cancelled'?'font-medium text-red-700':'text-slate-500'}>{phase==='Previous'?'Ended':phase}</span></div>
 <h2 className={`${detail?'text-xl':'text-lg'} font-bold`}>{detail?e.title:<Link href={eventHref} title={e.title} className="block rounded-xl bg-slate-100 px-3 py-2.5 text-slate-900 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><span className="block whitespace-normal break-words">{e.title}</span></Link>}</h2>
 <p className="mt-2 text-xs text-slate-500">By <Link href={`/events/${e.id}/organizer`} className="font-medium text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-blue-700 hover:decoration-blue-700">{e.creator}</Link></p>
 <p className={`mt-4 whitespace-pre-wrap break-words text-slate-700 ${detail?'':'line-clamp-2 text-sm leading-6'}`}>{e.description}</p>
 <dl className="my-4 grid gap-2 text-sm">
 <div><dt className="inline font-semibold">When: </dt><dd className="inline">{nyDate(e.starts_at)}{detail&&` · ${e.duration_minutes} min`}</dd></div>
 <div><dt className="inline font-semibold">Where: </dt><dd className="inline break-words">{detail?e.location:venue} {detail&&e.format==='in_person'&&<a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}${e.place_id?`&query_place_id=${encodeURIComponent(e.place_id)}`:''}`} className="underline">{e.place_id?'Map ↗':'Map search ↗'}</a>}</dd></div>
 {detail&&<div><dt className="inline font-semibold">Budget: </dt><dd className="inline">{e.budget===0?'Free':`~$${e.budget} / person`} · Up to {e.capacity} people</dd></div>}
 {!hostConfirmed&&<div className="flex items-center gap-1.5 border-t border-slate-100 pt-2 text-slate-500"><dt>Host confirmed:</dt><dd className="font-semibold">No</dd></div>}
 </dl>
 {e.tags.length>0&&<div className="mb-4 flex flex-wrap gap-2">{e.tags.map(t=><span key={t} className="rounded-md bg-slate-100 px-2 py-1 text-xs">{TAGS.find(x=>x.slug===t)?.label??t}</span>)}</div>}
 {detail&&e.hosting_details&&<div className="mb-5 rounded-xl bg-green-50 p-4"><h3 className="font-semibold">Hosting details</h3><p className="mt-2 whitespace-pre-wrap text-sm">{e.hosting_details}</p></div>}
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"><Vote id={e.id} up={e.upvotes} down={e.downvotes} mine={e.myVote} closed={closed} signedIn={signedIn} compact={!detail}/>{!detail&&<Link href={eventHref} aria-label={`View details for ${e.title}`} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">Details <span aria-hidden="true">→</span></Link>}</div>
 </div></article>;
}
