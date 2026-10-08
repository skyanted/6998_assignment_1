import Shell from '@/app/components/week4-shell';
import SignInPrompt from '@/app/components/sign-in-prompt';
import {context} from '@/lib/week4/data';
import ProfileForm from './profile-form';
export default async function ProfilePage(){
 const result=await context().catch(()=>null);
 if(!result)return <Shell section="Profile"><h1 className="text-3xl font-bold">Profile</h1><p role="alert" className="mt-6">Your account data could not be loaded. Please try again.</p></Shell>;
 const {user,profile}=result;
 if(!user)return <Shell section="Profile"><h1 className="text-3xl font-bold">Profile</h1><SignInPrompt section="Profile"/></Shell>;
 const data=profile??{id:user.id,first_name:null,last_name:null,email:null,bio:'',occupation:null,city:null,avatar_path:null,published:false,tags:[]};
 return <Shell section="Profile"><div className="mb-8"><h1 className="text-3xl font-bold">Your community profile</h1><p className="mt-3 text-slate-500">Your name, photo, introduction, and interests, all in one place.</p></div><ProfileForm profile={data}/></Shell>;
}
