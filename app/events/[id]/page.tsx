import {notFound} from 'next/navigation';
import {events} from '@/lib/week4/data';
import Shell from '@/app/components/week4-shell';
import EventCard from '@/app/components/week4-event';
export default async function Detail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const result=await events().catch(()=>null);if(!result)return <Shell section="Activity"><p role="alert">Activities could not be loaded. Please try again.</p></Shell>;
 if(!result.user)return <Shell section="Activity">{null}</Shell>;
 const event=result.data.find(e=>String(e.id)===id);if(!event)notFound();
 return <Shell section="Activity"><div className="mx-auto max-w-2xl"><EventCard event={event} signedIn={!!result.user} now={result.now} detail/></div></Shell>;
}
