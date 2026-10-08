import {NextResponse} from 'next/server';
import {context} from '@/lib/week4/data';
import {generate,promptFor,resolvePlace} from '@/lib/week4/gemini';
import {TAGS} from '@/lib/week4/types';
export const maxDuration=60;
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return NextResponse.json({error:'Invalid request origin.'},{status:403});
 let gid:number|null=null,imagePath:string|null=null;let db:Awaited<ReturnType<typeof context>>['db']|null=null;
 try{
 const ctx=await context();db=ctx.db;if(!ctx.user)return NextResponse.json({error:'Sign in to generate activities.'},{status:401});
 if(!ctx.profile?.published)return NextResponse.json({error:'Complete your Profile first.'},{status:403});
 if(!process.env.GEMINI_API_KEY)return NextResponse.json({error:'Gemini API key is not configured yet.'},{status:503});
 if(Number(request.headers.get('content-length'))>4*1024*1024)return NextResponse.json({error:'Upload up to 3 MB.'},{status:413});
 const form=await request.formData(),idea=String(form.get('idea')??'').trim(),format=String(form.get('format')),region=String(form.get('region'));const raw=form.get('photo');const image=raw instanceof File&&raw.size?raw:null;
 const tags:unknown=JSON.parse(String(form.get('tags')??'[]'));
 if(idea.length>1000||!['any','in_person','online'].includes(format)||!['any','Campus / Morningside Heights','Manhattan','Anywhere in NYC'].includes(region)||!Array.isArray(tags)||tags.length>3||tags.some(t=>!TAGS.some(x=>x.slug===t))||(!idea&&!image&&tags.length===0))return NextResponse.json({error:'Check your activity preferences.'},{status:400});
 if(image&&(!['image/jpeg','image/png','image/webp'].includes(image.type)||image.size>3*1024*1024))return NextResponse.json({error:'Choose a JPEG, PNG or WebP up to 3 MB.'},{status:400});
 const catalog=await db.from('week4_covers').select('id,description,image_path');if(catalog.error||!catalog.data?.length)throw new Error('Activity covers could not be loaded.');
 const covers=catalog.data;const minimumStart=new Date().toISOString(),input={idea,format,region,tags:tags as string[]},prompt=promptFor(input,minimumStart,covers);
 if(image)imagePath=`${ctx.user.id}/${crypto.randomUUID()}.${image.type==='image/jpeg'?'jpg':image.type==='image/png'?'png':'webp'}`;
 const begin=await db.rpc('week4_begin_generation',{p_inputs:input,p_prompt:prompt,p_model:process.env.GEMINI_MODEL??'gemini-3.5-flash-lite',p_image:imagePath});if(begin.error)throw new Error(begin.error.message);gid=begin.data;
 if(image&&imagePath){const upload=await db.storage.from('week4-event-images').upload(imagePath,image,{contentType:image.type});if(upload.error)throw new Error('Image upload failed.');}
 const rawPlan=await generate(prompt,image,covers);const plan=await resolvePlace(rawPlan);if(Date.parse(plan.starts_at)<=Date.now())throw new Error('AI suggested a time in the past. Please regenerate.');
 const finish=await db.rpc('week4_finish_generation',{gid,result:plan,original_result:rawPlan,generation_proof:process.env.WEEK4_GENERATION_SECRET});if(finish.error)throw new Error('Unable to save generated activity.');
 return NextResponse.json({id:gid,plan,minimumStart,coverUrl:`/api/week4/cover/${encodeURIComponent(plan.cover_id!)}`});
 }catch(e){if(db&&gid)await db.rpc('week4_finish_generation',{gid,result:null,generation_proof:process.env.WEEK4_GENERATION_SECRET});if(db&&imagePath)await db.storage.from('week4-event-images').remove([imagePath]);return NextResponse.json({error:e instanceof Error?e.message:'Generation failed.'},{status:500});}
}
