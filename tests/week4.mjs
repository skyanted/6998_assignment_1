import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../lib/week4/types.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {nyToISO,nyDate,validatePlan}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
for(const [local,expected] of [['2026-10-17T14:00','2026-10-17T18:00:00.000Z'],['2026-11-07T14:00','2026-11-07T19:00:00.000Z']])if(nyToISO(local)!==expected)throw Error('Timezone conversion failed');
for(const [input,expected] of [
 ['2026-10-16T23:00:00Z','Oct 16, 7:00 PM EDT'],
 ['2026-11-07T19:00:00Z','Nov 7, 2:00 PM EST'],
 ['2026-10-17T04:00:30.123Z','Oct 17, 12:00 AM EDT'],
 ['2026-11-01T05:30:00Z','Nov 1, 1:30 AM EDT'],
 ['2026-11-01T06:30:00Z','Nov 1, 1:30 AM EST']
])if(nyDate(input)!==expected)throw Error('Stable date text mismatch: '+nyDate(input));
console.log('Stable date display: punctuation, AM/PM, midnight and DST: PASS');
let invalid=false;try{validatePlan({title:'bad'});}catch{invalid=true;}if(!invalid)throw Error('Invalid AI result accepted');
console.log('New York time, DST and AI validation: PASS');
const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth; create schema private; create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id bigint generated always as identity primary key,bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;`);
const sql=readFileSync(new URL('../supabase/week4.sql',import.meta.url),'utf8').split('create extension if not exists pg_cron')[0];
await db.exec(sql);
await db.exec("insert into private.week4_generation_config values(true,md5('test-proof'));");
console.log('Schema and function creation: PASS');
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';
await db.exec(`insert into auth.users values('${a}'),('${b}');`);
async function asUser(uid,sql){await db.exec(`set role authenticated; set request.jwt.claim.sub='${uid}';`);try{return await db.query(sql);}finally{await db.exec('reset role');}}
await asUser(a,`select public.week4_profile_save('{"first_name":"Test","last_name":"One","bio":"Hello"}',array['food','arts','city']);`);
await asUser(b,`select public.week4_profile_save('{"first_name":"Test","last_name":"Two"}',array['gaming']);`);
async function rejects(uid,sql,label){let failed=false;try{await asUser(uid,sql);}catch{failed=true;}if(!failed)throw new Error(label+' incorrectly allowed');console.log(label+': PASS');}
await rejects(a,`select public.week4_profile_save('{"first_name":"Test","last_name":"One"}',array['food','arts','city','gaming']);`,'Four tags rejected');
await rejects(a,`select public.week4_profile_save('{"first_name":"Test","last_name":"One"}',array['custom']);`,'Custom tags rejected');
await rejects(a,`update public.week4_profiles set bio='hacked' where id='${b}';`,'Direct profile writes denied');
const gid=(await asUser(a,`select public.week4_begin_generation('{}','Actual prompt','test',null) gid;`)).rows[0].gid;
if((await db.query(`select round_id from public.week4_ai_generations where id=${gid}`)).rows[0].round_id!==null)throw Error('Generation still requires weekly round');
console.log('Generation has no weekly round: PASS');
const eventTime=new Date(Date.now()+86400000).toISOString();
const output={cover_id:'gaming',title:'Test activity',description:'A fixture for testing.',format:'online',location:'Discord',starts_at:eventTime,duration_minutes:60,budget:0,capacity:8,tags:['gaming']};
await rejects(a,`select public.week4_finish_generation(${gid},'${JSON.stringify(output)}');`,'Client cannot fake AI output');
await asUser(a,`select public.week4_finish_generation(${gid},'${JSON.stringify(output)}',null,'test-proof');`);
await rejects(b,`select public.week4_finish_generation(${gid},'{}',null,'test-proof');`,'Cross-owner generation denied');
const past=new Date(Date.now()-60000).toISOString();
await rejects(a,`select public.week4_publish(${gid},'${past}');`,'Past start rejected');
const legacyRound=(await db.query("insert into public.week4_rounds(closes_at) values(now()-interval '1 week') returning id")).rows[0].id;
async function fixture(uid,rid='null',status='ready'){return (await db.query(`insert into public.week4_ai_generations(user_id,round_id,inputs,prompt,model,output,status) values('${uid}',${rid},'{}','Fixture prompt','test','${JSON.stringify(output)}','${status}') returning id`)).rows[0].id;}
const sibling=await fixture(a,legacyRound),pendingSibling=await fixture(a,'null','pending'),foreignDraft=await fixture(b);
const eid=(await asUser(a,`select public.week4_publish(${gid},'${eventTime}') eid;`)).rows[0].eid;
let states=(await db.query(`select id,status from public.week4_ai_generations where id in (${sibling},${pendingSibling},${foreignDraft})`)).rows;
if(states.find(g=>g.id===sibling)?.status!=='discarded'||states.find(g=>g.id===pendingSibling)?.status!=='discarded'||states.find(g=>g.id===foreignDraft)?.status!=='ready')throw Error('Draft cleanup scope incorrect');
console.log('All own drafts discarded; other owners preserved: PASS');
await rejects(a,`select public.week4_publish(${sibling},'${eventTime}');`,'Discarded draft cannot publish');
const later=await fixture(a);
await rejects(a,`select public.week4_publish(${later},'${past}');`,'Failed publication preserves draft');
if((await db.query(`select status from public.week4_ai_generations where id=${later}`)).rows[0].status!=='ready')throw Error('Failed publication discarded draft');
const second=(await asUser(a,`select public.week4_publish(${later},'${eventTime}') eid`)).rows[0].eid;
if((await db.query(`select status from public.week4_ai_generations where id=${gid}`)).rows[0].status!=='ready')throw Error('Published generation discarded');
console.log('Previous published activity preserved: PASS');
await asUser(b,`select public.week4_vote(${eid},1);`);await asUser(b,`select public.week4_vote(${eid},1);`);
let counts=(await db.query(`select upvotes,downvotes from public.week4_events where id=${eid}`)).rows[0];if(counts.upvotes!==1||counts.downvotes!==0)throw Error('Duplicate vote counted');
console.log('One vote per user: PASS');
await asUser(b,`select public.week4_vote(${eid},-1);`);counts=(await db.query(`select upvotes,downvotes from public.week4_events where id=${eid}`)).rows[0];if(counts.upvotes!==0||counts.downvotes!==1)throw Error('Vote switch incorrect');console.log('Vote switching: PASS');
await asUser(b,`select public.week4_vote(${eid},0);`);counts=(await db.query(`select upvotes,downvotes from public.week4_events where id=${eid}`)).rows[0];if(counts.upvotes!==0||counts.downvotes!==0)throw Error('Vote withdrawal incorrect');console.log('Vote withdrawal: PASS');
if((await asUser(b,'select * from public.week4_upvote_history')).rows.length!==1)throw Error('Upvote history lost on withdrawal');
if((await asUser(a,'select * from public.week4_upvote_history')).rows.length)throw Error('Other user history leaked');
console.log('Upvote history retained and private: PASS');
await rejects(b,`select public.week4_set_hosting(${eid},'confirmed','Not mine');`,'Only organizer can confirm');
await asUser(a,`select public.week4_set_hosting(${eid},'confirmed','Meet in the voice channel.');`);
await asUser(a,`select public.week4_set_hosting(${second},'confirmed','Another organizer decision.');`);
console.log('Any organizer activity can be confirmed without ranking or settlement: PASS');
await asUser(a,`select public.week4_set_hosting(${eid},'cancelled','');`);
await rejects(b,`select public.week4_vote(${eid},1);`,'Cancelled activity voting denied');
await asUser(a,`select public.week4_set_hosting(${eid},'confirmed','New meeting details.');`);
await asUser(b,`select public.week4_vote(${eid},1);`);
console.log('Hosting cancellation and reconfirmation: PASS');
await db.exec(`update public.week4_events set starts_at=now()-interval '30 minutes' where id=${eid};`);
await asUser(b,`select public.week4_vote(${eid},-1);`);
await asUser(a,`select public.week4_set_hosting(${eid},'confirmed','Ongoing update.');`);
console.log('Ongoing activity voting and hosting update allowed: PASS');
await db.exec(`update public.week4_events set starts_at=now()-interval '61 minutes' where id=${eid};`);
await rejects(b,`select public.week4_vote(${eid},1);`,'Ended activity voting denied');
await rejects(a,`select public.week4_set_hosting(${eid},'cancelled','Too late');`,'Ended hosting decision fixed');
await rejects(a,`update public.week4_events set starts_at=now()+interval '1 month' where id=${eid};`,'Published time immutable');
if((await asUser(b,`select * from public.week4_ai_generations where user_id='${a}'`)).rows.length)throw Error('Other user draft leaked');
console.log('Other user draft privacy: PASS');
await db.exec('set role anon');
for(const table of ['week4_events','week4_upvote_history']){let denied=false;try{await db.query(`select * from public.${table}`);}catch{denied=true;}if(!denied)throw Error('Anonymous read allowed');}
let denied=false;try{await db.query(`select public.week4_vote(${second},1)`);}catch{denied=true;}if(!denied)throw Error('Anonymous vote allowed');
console.log('Anonymous business reads and mutations denied: PASS');
await db.exec('reset role');await db.close();
