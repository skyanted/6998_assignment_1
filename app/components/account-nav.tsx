/* eslint-disable @next/next/no-img-element -- Private avatar is served by our image route. */
'use client';
import Link from '@/app/components/loading-link';
import {usePathname} from 'next/navigation';
import {HomeIcon,CreateIcon,PersonIcon} from './nav-icons';
export default function AccountNav({name='',avatar=null,signedIn=false}:{name?:string;avatar?:string|null;signedIn?:boolean}){
 const path=usePathname();
 const initials=name.trim().split(/\s+/).filter(Boolean).map(w=>Array.from(w)[0]).slice(0,2).join('').toUpperCase();
 const mineIcon=avatar?<img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover"/>:signedIn?<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">{initials||'ME'}</span>:<PersonIcon/>;
 return <nav aria-label="Main navigation" className="space-y-2">{[
 {href:'/',label:'Home',icon:<HomeIcon/>,active:path==='/'||path.startsWith('/events')},
 {href:'/create',label:'Create',icon:<CreateIcon/>,active:path==='/create'},
 {href:'/mine',label:'Mine',icon:mineIcon,active:path==='/mine'}
 ].map(item=><Link key={item.href} href={item.href} aria-current={item.active?'page':undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${item.active?'bg-blue-50 text-blue-700':'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><span className="flex w-8 justify-center">{item.icon}</span>{item.label}</Link>)}</nav>;
}
