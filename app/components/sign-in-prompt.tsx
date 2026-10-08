import Link from 'next/link';
export type Section='Home'|'Previous / Ongoing'|'Members'|'Profile'|'Create / Mine'|'Activity';
const messages:Record<Section,string>={Home:'view activity proposals', 'Previous / Ongoing':'track previous and ongoing activities',Members:'view community members',Profile:'view and edit your profile','Create / Mine':'generate and manage your activity proposals',Activity:'view this activity'};
export default function SignInPrompt({section}:{section:Section}){return <section className="mt-6 rounded-xl border border-slate-300 p-6"><p className="mb-5">Please sign in to {messages[section]}.</p><Link href="/login" className="inline-block rounded-lg bg-blue-700 px-5 py-3 text-white">Go to sign in</Link></section>;}
