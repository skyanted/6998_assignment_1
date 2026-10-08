import {readFile} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {createAuthClient} from '@/lib/supabase/server';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const db=await createAuthClient('public');const {data:{user}}=await db.auth.getUser();if(!user)return new Response('Sign in required',{status:401});
 const {id}=await params;const {data,error}=await db.from('week4_covers').select('image_path').eq('id',id).maybeSingle();
 if(error||!data||!/^\/week4-covers\/[a-z]+[.]jpg$/.test(data.image_path))return new Response('Not found',{status:404});
 try{const bytes=await readFile(join(process.cwd(),'assets/week4-covers',basename(data.image_path)));return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Not found',{status:404});}
}
