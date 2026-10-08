import {createAuthClient} from '@/lib/supabase/server';
export async function GET(request:Request){
 const db=await createAuthClient('public');const {data:{user}}=await db.auth.getUser();if(!user)return new Response('Sign in required',{status:401});
 const url=new URL(request.url),bucket=url.searchParams.get('bucket'),path=url.searchParams.get('path');
 if(!bucket||!['week4-avatars','week4-event-images'].includes(bucket)||!path||path.length>250||path.includes('..'))return new Response('Invalid image',{status:400});
 const {data,error}=await db.storage.from(bucket).download(path);if(error||!data)return new Response('Not found',{status:404});
 if(!['image/jpeg','image/png','image/webp'].includes(data.type))return new Response('Invalid image',{status:400});
 return new Response(await data.arrayBuffer(),{headers:{'Content-Type':data.type,'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
}
