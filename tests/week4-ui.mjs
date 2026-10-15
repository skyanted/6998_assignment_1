import {readFileSync} from 'node:fs';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
const check=(ok,label)=>{if(!ok)throw Error(label);};
function compile(file,dependencies){const compiledModule={exports:{}};const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',code)(name=>{if(!(name in dependencies))throw Error('Missing dependency '+name);return dependencies[name];},compiledModule,compiledModule.exports);return compiledModule.exports;}
const types=compile('lib/week4/types.ts',{});
let state=[],index=0;
const hooks={useState(initial){const i=index++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next;}];},useEffect(){},useRef(initial){return {current:initial};}};
const noop=()=>null;
const navigation=compile('lib/week4/navigation.ts',{});
global.sessionStorage={getItem(){return null;},setItem(){},removeItem(){}};
const Generator=compile('app/dashboard/generator.tsx',{'react':hooks,'react/jsx-runtime':jsx,'next/navigation':{useRouter:()=>({refresh(){}})},'./publish-form':{default:noop},'@/app/components/loading-indicator':{Spinner:noop},'@/app/components/week4-plan':{default:noop},'@/lib/week4/types':types,'@/lib/week4/navigation':navigation}).default;
const render=()=>{index=0;return Generator({enabled:true});};
function nodes(tree){if(!tree||typeof tree!=='object')return [];if(Array.isArray(tree))return tree.flatMap(nodes);return [tree,...nodes(tree.props?.children)];}
const control=(tree,id)=>nodes(tree).find(n=>n.props?.['aria-controls']===id);
const tagInput=(tree,label)=>{const l=nodes(tree).find(n=>n.type==='label'&&Array.isArray(n.props.children)&&n.props.children.includes(label));return nodes(l).find(n=>n.type==='input');};
const png=new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jMZkAAAAASUVORK5CYII=','base64')],'inspiration.png',{type:'image/png'});
const realFetch=global.fetch;let sent;
global.fetch=async(_url,request)=>{sent=request.body;return {ok:true,json:async()=>({id:1,plan:{},minimumStart:new Date().toISOString(),coverUrl:'/cover'})};};
try{for(let mask=0;mask<16;mask++){
 state=[];let tree=render();for(const id of ['activity-format-options','area-options','interest-options','photo-options'])control(render(),id).props.onChange({target:{checked:true}});
 tree=render();nodes(tree).find(n=>n.type==='textarea').props.onChange({target:{value:'A community activity'}});
 const selects=nodes(tree).filter(n=>n.type==='select');selects[0].props.onChange({target:{value:'online'}});selects[1].props.onChange({target:{value:'Manhattan'}});
 for(const tag of ['Food','Arts','Study']){tree=render();tagInput(tree,tag).props.onChange({target:{checked:true}});}tree=render();check(tagInput(tree,'Gaming').props.disabled,'Fourth interest is disabled');
 nodes(tree).find(n=>n.type==='input'&&n.props.type==='file').props.onChange({target:{files:[png]}});
 tree=render();const ids=['activity-format-options','area-options','interest-options','photo-options'];ids.forEach((id,i)=>control(render(),id).props.onChange({target:{checked:!!(mask&(1<<i))}}));
 tree=render();ids.forEach((id,i)=>check(!!nodes(tree).find(n=>n.props?.id===id)===!!(mask&(1<<i)),'Checkbox controls visibility '+id));
 await nodes(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 check(sent.get('format')===(mask&1?'online':'any'),'Format opt-in payload');check(sent.get('region')===(mask&2?'Manhattan':'any'),'Area opt-in payload');check(sent.get('tags')===JSON.stringify(mask&4?['food','arts','study']:[]),'Unchecked interests ignored');check(!!sent.get('photo')===!!(mask&8),'Unchecked photo ignored');
 }
 let completeRequest,requests=0;
 global.fetch=(_url,request)=>{requests++;sent=request.body;return new Promise(resolve=>{completeRequest=resolve;});};
 const preview=()=>nodes(render()).find(n=>typeof n.props?.onRegenerate==='function');
 const originalId=preview().props.id;
 preview().props.onRegenerate();
 check(requests===0&&preview().props.id===originalId&&!preview().props.regenerating,'Generate another does not call AI or discard the preview');
 nodes(render()).find(n=>n.type==='textarea').props.onChange({target:{value:'Updated idea after returning to editor'}});
 const submit=()=>nodes(render()).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 let generating=submit();
 check(requests===1&&sent.get('idea')==='Updated idea after returning to editor','AI is called only after explicitly submitting the edited idea');
 check(preview().props.id===originalId&&preview().props.regenerating,'New generation keeps the current preview visible while busy');
 completeRequest({ok:false,json:async()=>({error:'Generation limit reached. Please wait at least 10 seconds between generations.'})});
 await generating;
 check(preview().props.id===originalId&&!preview().props.regenerating,'Failed generation preserves the previous preview');
 check(nodes(render()).some(n=>n.props?.role==='alert'&&n.props.children.includes('10 seconds')),'Cooldown message clearly states the ten-second interval');
 generating=submit();
 completeRequest({ok:true,json:async()=>({id:originalId+1,plan:{title:'Another idea'},minimumStart:new Date().toISOString(),coverUrl:'/cover'})});
 await generating;
 check(preview().props.id===originalId+1&&!preview().props.regenerating,'Successful generation replaces the preview with the new saved draft');
 console.log('Generate another requires explicit resubmission; edited inputs, cooldown errors and preview retention: PASS');
 console.log('Advanced options: all 16 combinations, hidden values ignored, photo opt-in, max 3 interests: PASS');
}finally{global.fetch=realFetch;}
const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
const Vote=props=>React.createElement('div',{},props.closed?`Final up ${props.up} down ${props.down}`:'Voting open');
const EventCard=compile('app/components/week4-event.tsx',{'react/jsx-runtime':jsx,'@/app/components/loading-link':{default:Link},'@/lib/week4/types':types,'./week4-vote':{default:Vote}}).default;
let clock=Date.parse('2026-10-16T19:00:00Z');
const event={id:1,title:'Boundary activity',creator:'Demo Member',description:'Test activity',starts_at:'2026-10-16T20:00:00Z',format:'online',location:'Discord',duration_minutes:60,budget:0,capacity:10,tags:['gaming'],imageUrl:null,upvotes:4,downvotes:2,myVote:0,hosting_status:'confirmed',wasUpvoted:true,published_at:'2026-10-08T12:00:00Z',confirmed_at:'2026-10-15T01:00:00Z',hosting_details:'Join the voice channel.'};
const additional=[{...event,id:2,title:'Second ranked activity',upvotes:5,downvotes:1,wasUpvoted:false},{...event,id:3,title:'Third ranked activity',upvotes:1,downvotes:0,wasUpvoted:false},{...event,id:4,title:'Fourth ranked activity',upvotes:0,downvotes:0,wasUpvoted:false}];
const Feed=compile('app/components/week4-feed.tsx',{'react/jsx-runtime':jsx,'@/app/components/loading-link':{default:Link},'@/lib/week4/data':{events:async()=>({data:[event,...additional],user:{id:'demo'},now:clock})},'@/lib/week4/types':types,'./week4-shell':{default:({children})=>children},'./week4-event':{default:EventCard},'./event-filter-form':{default:({children,resetHref})=>React.createElement('form',{},children,React.createElement('a',{href:resetHref},'Reset'))}}).default;
async function html(previous,extra={}){return renderToStaticMarkup(await Feed({previous,...extra}));}
let markup=await html(false);check(markup.includes(event.title)&&markup.includes('Hosting confirmed')&&markup.includes('Upcoming')&&markup.includes('Voting open'),'Upcoming proposal with confirmed hosting');
check(!(await html(true)).includes(event.title),'Future plans stay out of Ongoing / Previous');
clock=Date.parse(event.starts_at);markup=await html(true);check(markup.includes('Ongoing')&&markup.includes('Voting open'),'Ongoing plans appear in combined history with open voting');
check(!(await html(false)).includes(event.title),'Ongoing plans leave Upcoming');
clock=types.eventEnd(event);markup=await html(true);check(markup.includes('Ended')&&markup.includes('Final up 4 down 2')&&!markup.includes('Join the voice channel.'),'Compact ended cards retain final votes without duplicating hosting details');
clock=Date.parse('2026-10-16T19:00:00Z');markup=await html(false);check(markup.includes('Popular #1')&&markup.includes('Popular #2')&&markup.includes('Popular #3')&&!markup.includes('Popular #4'),'Popular badges only for top three');check(markup.indexOf('Second ranked activity')<markup.indexOf('Boundary activity'),'Popular is the default');
markup=await html(false,{sort:'latest'});check(!markup.includes('Popular #1'),'Latest has no ranking badge');
event.hosting_status='cancelled';check(!(await html(false)).includes(event.title)&&(await html(true)).includes('Cancelled'),'Cancellation moves event into combined history');
check(markup.includes('Ongoing / Previous')&&!markup.includes('All Previous'),'Home has one combined history tab');
for(const url of ['https://evil.com','//evil.com','/\\evil.com','/members','/auth/callback','/create/../../evil'])check(navigation.safeReturnTo(url)==='/','Unsafe return URL rejected: '+url);
for(const url of ['/create','/mine?tab=upvoted','/events/123#vote-123','/?view=history'])check(navigation.safeReturnTo(url)===url,'Local task return location retained');
const Nav=compile('app/components/account-nav.tsx',{'react/jsx-runtime':jsx,'@/app/components/loading-link':{default:Link},'next/navigation':{usePathname:()=>'/create'},'./nav-icons':{HomeIcon:noop,CreateIcon:noop,PersonIcon:noop}}).default;
markup=renderToStaticMarkup(Nav({signedIn:true,name:'Alex Morgan'}));check(markup.includes('Home')&&markup.includes('Create')&&markup.includes('Mine')&&!markup.includes('Members')&&!markup.includes('Previous'),'Navigation has exactly three purposes');check(markup.includes('AM'),'Mine shows initials when avatar is missing');check(markup.includes('aria-current="page"'),'Active navigation is indicated');
console.log('Combined timeline, event boundaries, ranking, safe login return and three-entry navigation: PASS');

markup=renderToStaticMarkup(React.createElement(EventCard,{event:{...event,hosting_status:'confirmed'},signedIn:false,now:clock}));
check(!markup.includes('AI-generated proposal'),'No AI-generated tag on activity cards');
check(markup.includes('Hosting confirmed')&&markup.includes('bg-emerald-50')&&!markup.includes('Host confirmed:')&&!markup.includes('The organizer has confirmed'),'Prominent confirmation banner without duplicate status or explanation');
check(markup.includes('Open Details for hosting information'),'Confirmed cards point to hosting information in Details');
check(!markup.includes('Join the voice channel.')&&markup.includes('Test activity')&&markup.includes('line-clamp-2')&&markup.includes('Gaming')&&!markup.includes('Score '),'Compact cards show tags and a two-line description without hosting details or redundant score');
const detail=renderToStaticMarkup(React.createElement(EventCard,{event:{...event,hosting_status:'confirmed'},signedIn:false,now:clock,detail:true}));
check(detail.includes('Join the voice channel.')&&detail.includes('Test activity'),'Event details retain the full description and hosting details');
check(markup.includes('/events/1/organizer')&&markup.includes('underline-offset-4'),'Publisher name links to a public organizer profile');
console.log('Card label cleanup, prominent hosting confirmation and organizer links: PASS');

event.hosting_status='undecided';
markup=await html(false,{host:'confirmed'});check(!markup.includes(event.title)&&markup.includes('Second ranked activity'),'Hosting filter excludes unconfirmed events');
markup=await html(false,{host:'undecided',format:'online',tag:'gaming'});check(markup.includes(event.title)&&!markup.includes('Second ranked activity'),'Multiple filters combine');
check(markup.includes('host=undecided&amp;format=online&amp;tag=gaming')&&markup.includes('sort=latest&amp;host=undecided'),'Filter values survive sort and timeline navigation');
markup=await html(false,{format:'in_person'});check(markup.includes('No events match your filters.')&&markup.includes('Clear filters'),'Empty filter results offer reset');
markup=await html(false,{host:'invalid',format:'invalid',tag:'invalid'});check(markup.includes(event.title)&&markup.includes('Second ranked activity'),'Unknown filter values do not hide events');
clock=types.eventEnd(event);markup=await html(true,{host:'undecided'});check(markup.includes(event.title)&&!markup.includes('Second ranked activity'),'Filters also apply in history');
console.log('Hosting, format and interest filters, navigation persistence, empty results: PASS');

const SignInPrompt=compile('app/components/sign-in-prompt.tsx',{'react/jsx-runtime':jsx,'@/app/components/loading-link':{default:Link},'@/lib/week4/navigation':navigation}).default;
const denyPrivateRender=()=>{throw Error('Anonymous Mine attempted to render private content');};
const Mine=compile('app/mine/page.tsx',{'react/jsx-runtime':jsx,'@/app/components/loading-link':{default:Link},'@/app/components/week4-shell':{default:({children})=>children},'@/app/components/sign-in-prompt':{default:SignInPrompt},'@/app/components/week4-event':{default:denyPrivateRender},'@/lib/week4/data':{context:async()=>({user:null,profile:null}),events:denyPrivateRender},'@/app/dashboard/hosting-form':{default:denyPrivateRender},'@/app/profile/profile-form':{default:denyPrivateRender},'@/lib/week4/types':types}).default;
for(const tab of ['activities','upvoted','profile']){
 const markup=renderToStaticMarkup(await Mine({searchParams:Promise.resolve({tab})}));
 for(const label of ['Published events','Upvoted events','Personal profile'])check(markup.includes(label),'Mine entry remains visible: '+label);
 const next=tab==='activities'?'/mine':`/mine?tab=${tab}`;
 check(markup.includes(navigation.loginHref(next)),'Sign-in returns to selected Mine tab');
 check(!markup.includes('<form')&&!markup.includes('<input')&&!markup.includes('<article'),'Anonymous tab exposes no personal content');
}
console.log('All Mine tabs gate private reads and forms, retaining selected-tab sign-in return: PASS');

const detailDeps={'react/jsx-runtime':jsx,'@/app/components/loading-link':{default:Link},'next/navigation':{notFound(){throw Error('Not found');}},'@/lib/week4/navigation':navigation,'@/app/components/week4-shell':{default:({children})=>children},'@/app/components/sign-in-prompt':{default:SignInPrompt}};
const PrivateDetail=compile('app/events/[id]/page.tsx',{...detailDeps,'@/lib/week4/data':{context:async()=>({user:null}),events(){throw Error('Anonymous detail page fetched event data');}},'@/app/components/week4-event':{default:denyPrivateRender}}).default;
const target='/events/1?from='+encodeURIComponent('/mine?tab=upvoted');
markup=renderToStaticMarkup(await PrivateDetail({params:Promise.resolve({id:'1'}),searchParams:Promise.resolve({from:'/mine?tab=upvoted'})}));
check(markup.includes('Sign in to view this event.')&&!markup.includes('<article')&&!markup.includes(event.description)&&!markup.includes(event.hosting_details),'Anonymous detail URL shows a prompt without fetching or rendering the full event');
check(markup.includes(navigation.loginHref(target,'details').replaceAll('&','&amp;')),'Detail sign-in returns to the event with its Back destination preserved');
const MemberDetail=compile('app/events/[id]/page.tsx',{...detailDeps,'@/lib/week4/data':{context:async()=>({user:{id:'demo'}}),events:async()=>({user:{id:'demo'},data:[event],now:clock})},'@/app/components/week4-event':{default:EventCard}}).default;
markup=renderToStaticMarkup(await MemberDetail({params:Promise.resolve({id:'1'}),searchParams:Promise.resolve({})}));
check(markup.includes(event.description)&&markup.includes(event.hosting_details),'Authenticated detail page shows the full plan and hosting information');
console.log('Event detail route gates anonymous reads, preserves login return and allows signed-in full plans: PASS');
