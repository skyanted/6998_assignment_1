import {NextResponse} from 'next/server';
import {safeReturnTo} from '@/lib/week4/navigation';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Invalid origin',{status:403});
 const {next}=await request.json();const response=NextResponse.json({ok:true});
 response.cookies.set('week4-return-to',safeReturnTo(typeof next==='string'?next:null),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:1800});return response;
}
