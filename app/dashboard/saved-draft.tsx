 'use client';
import PlanDetails from '@/app/components/week4-plan';
import PublishForm from './publish-form';
import type {Generation} from '@/lib/week4/types';
export default function Draft({draft,now,needsName=false}:{draft:Generation & {imageUrl:string|null};now:number;needsName?:boolean}){
 if(!draft.output)return null;
 return <details className="mb-4 rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-semibold">{draft.output.title}<span className="ml-3 text-xs font-normal text-slate-400">Draft · Preview & publish</span></summary><div className="my-5"><PlanDetails plan={draft.output} imageUrl={draft.imageUrl}/></div><PublishForm id={draft.id} time={draft.output.starts_at} minimumStart={new Date(now).toISOString()} needsName={needsName}/></details>;
}
