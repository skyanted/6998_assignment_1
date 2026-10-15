import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {TAGS} from '@/lib/week4/types';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!TAGS.some(tag=>tag.slug===id))return new Response('Not found',{status:404});
 try{const bytes=await readFile(join(process.cwd(),'assets/week4-covers',id+'.jpg'));return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/jpeg','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Not found',{status:404});}
}
