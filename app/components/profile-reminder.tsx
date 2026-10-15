 'use client';
import {useState} from 'react';
import Link from '@/app/components/loading-link';
export default function ProfileReminder(){const [hidden,setHidden]=useState(false);if(hidden)return null;return <aside className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-600"><p className="flex-1">Add your name so people know who is behind your plans.</p><Link href="/mine?tab=profile" className="font-semibold text-blue-700">Complete profile</Link><button aria-label="Dismiss profile reminder" onClick={()=>setHidden(true)} className="px-2 text-lg">×</button></aside>;}
