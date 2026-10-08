'use client';
import {useRef,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {createAuthBrowserClient} from '@/lib/supabase/browser';
import {TAGS,type Member} from '@/lib/week4/types';
import Avatar from '@/app/components/avatar';
export default function ProfileForm({profile}:{profile:Member}){
 const router=useRouter();const input=useRef<HTMLInputElement>(null);
 const [draft,setDraft]=useState({first_name:profile.first_name??'',last_name:profile.last_name??'',email:profile.email??'',bio:profile.bio,occupation:profile.occupation??'',city:profile.city??''});
 const [tags,setTags]=useState(profile.tags??[]),[path,setPath]=useState(profile.avatar_path),[photo,setPhoto]=useState<File|null>(null),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
 const browser=createAuthBrowserClient();const avatar=path?`/api/week4/image?bucket=week4-avatars&path=${encodeURIComponent(path)}`:null;
 async function save(e:FormEvent<HTMLFormElement>){
 e.preventDefault();setMessage('');if(!draft.first_name.trim()||!draft.last_name.trim()){setMessage('Add your first and last name.');return;}
 if(photo&&(!['image/jpeg','image/png','image/webp'].includes(photo.type)||photo.size>3*1024*1024)){setMessage('Choose a JPEG, PNG or WebP up to 3 MB.');return;}
 setPending(true);let upload:string|null=null;let saved=false;
 try{const {data:{user}}=await browser.auth.getUser();if(!user||user.id!==profile.id)throw new Error('Sign in to save your profile.');
 if(photo){upload=`${user.id}/${crypto.randomUUID()}.${photo.type==='image/jpeg'?'jpg':photo.type==='image/png'?'png':'webp'}`;const {error}=await browser.storage.from('week4-avatars').upload(upload,photo,{contentType:photo.type});if(error)throw new Error('Photo upload failed.');}
 const next=upload??path;const {error}=await browser.schema('public').rpc('week4_profile_save',{details:{...draft,avatar_path:next},selected_tags:tags});if(error)throw new Error(error.message);
 saved=true;if(upload&&path)await browser.storage.from('week4-avatars').remove([path]);setPath(next);setPhoto(null);if(input.current)input.current.value='';setMessage('Saved. Your card is visible in Members.');router.refresh();
 }catch(error){if(upload&&!saved)await browser.storage.from('week4-avatars').remove([upload]);setMessage(error instanceof Error?error.message:'Unable to save.');}finally{setPending(false);}
 }
 return <div className="mx-auto max-w-2xl"><form onSubmit={save} className="space-y-5 rounded-2xl border bg-white p-6">
 <Avatar name={`${draft.first_name} ${draft.last_name}`} photoUrl={avatar} size="large"/>
 <div className="grid gap-4 sm:grid-cols-2">{(['first_name','last_name'] as const).map(field=><label key={field} className="block text-sm font-medium">{field==='first_name'?'First name':'Last name'}<input required maxLength={100} value={draft[field]} onChange={e=>setDraft({...draft,[field]:e.target.value})} className="mt-2 w-full rounded-lg border p-3"/></label>)}</div>
 <label className="block text-sm font-medium">Profile photo<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhoto(e.target.files?.[0]??null)} className="mt-2 block text-sm"/><span className="mt-1 block text-xs text-slate-500">JPEG, PNG or WebP, up to 3 MB.</span></label>
 {(['email','occupation','city'] as const).map(field=><label key={field} className="block text-sm font-medium">{field==='email'?'Public contact email':field==='occupation'?'Role / occupation':'City'}<input type={field==='email'?'email':'text'} maxLength={field==='email'?254:field==='city'?100:50} value={draft[field]} onChange={e=>setDraft({...draft,[field]:e.target.value})} className="mt-2 w-full rounded-lg border p-3"/></label>)}
 <label className="block text-sm font-medium">Personal bio<textarea rows={5} maxLength={2000} value={draft.bio} onChange={e=>setDraft({...draft,bio:e.target.value})} className="mt-2 w-full rounded-lg border p-3"/></label>
 <fieldset><legend className="mb-3 text-sm font-medium">Interests · choose up to 3</legend><div className="flex flex-wrap gap-2">{TAGS.map(t=><label key={t.slug} className={`cursor-pointer rounded-full border px-3 py-2 text-sm ${tags.includes(t.slug)?'border-blue-600 bg-blue-50 text-blue-800':''}`}><input type="checkbox" className="mr-2" checked={tags.includes(t.slug)} disabled={!tags.includes(t.slug)&&tags.length===3} onChange={e=>setTags(e.target.checked?[...tags,t.slug]:tags.filter(x=>x!==t.slug))}/>{t.label}</label>)}</div></fieldset>
 <p className="text-xs text-slate-500">Saving publishes these details to Members. Only include contact information you want to share.</p><button disabled={pending} className="rounded-full bg-blue-700 px-6 py-3 text-white disabled:opacity-50">{pending?'Saving…':'Save profile'}</button>{message&&<p role="status" className="text-sm">{message}</p>}
 </form></div>;
}
