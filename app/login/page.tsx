import Link from '@/app/components/loading-link';
import Shell from '@/app/components/week4-shell';
import GoogleLogin from './google-login';
import {safeReturnTo} from '@/lib/week4/navigation';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string;next?:string;reason?:string}>}){
 const params=await searchParams,next=safeReturnTo(params.next);
 const description=params.reason==='vote'?'Sign in to vote.':params.reason==='details'?'Sign in to view event details.':next==='/create'?'Sign in to generate an event.':'Sign in to create and vote on events.';
 return <Shell><section className="mx-auto my-8 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10"><p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-700">CAMPUS PLANS</p><h1 className="text-3xl font-bold tracking-tight">Sign in</h1><p className="my-5 leading-7 text-slate-500">{description}</p>{params.error&&<p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">Sign-in could not be completed. Please try again.</p>}<GoogleLogin next={next}/><Link href={next} className="mt-6 inline-block text-sm text-slate-500">← Keep exploring</Link></section></Shell>;
}
