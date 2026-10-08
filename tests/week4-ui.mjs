import {readFileSync} from 'node:fs';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
const check=(ok,label)=>{if(!ok)throw Error(label);};
function compile(file,dependencies){const compiledModule={exports:{}};const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',code)(name=>{if(!(name in dependencies))throw Error('Missing dependency '+name);return dependencies[name];},compiledModule,compiledModule.exports);return compiledModule.exports;}
const types=compile('lib/week4/types.ts',{});
let state=[],index=0;
const hooks={useState(initial){const i=index++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next;}];},useEffect(){}};
const noop=()=>null;
const Generator=compile('app/dashboard/generator.tsx',{'react':hooks,'react/jsx-runtime':jsx,'next/navigation':{useRouter:()=>({refresh(){}})},'./publish-form':{default:noop},'@/app/components/week4-plan':{default:noop},'@/lib/week4/types':types}).default;
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
 console.log('Advanced options: all 16 combinations, hidden values ignored, photo opt-in, max 3 interests: PASS');
}finally{global.fetch=realFetch;}
const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
const Vote=props=>React.createElement('div',{},props.closed?`Final up ${props.up} down ${props.down}`:'Voting open');
const EventCard=compile('app/components/week4-event.tsx',{'react/jsx-runtime':jsx,'next/link':{default:Link},'@/lib/week4/types':types,'./week4-vote':{default:Vote}}).default;
let clock=Date.parse('2026-10-16T19:00:00Z');
const event={id:1,title:'Boundary activity',creator:'Demo Member',description:'Test activity',starts_at:'2026-10-16T20:00:00Z',format:'online',location:'Discord',duration_minutes:60,budget:0,capacity:10,tags:['gaming'],imageUrl:null,upvotes:4,downvotes:2,myVote:0,hosting_status:'confirmed',wasUpvoted:true,published_at:'2026-10-08T12:00:00Z',confirmed_at:'2026-10-15T01:00:00Z',hosting_details:'Join the voice channel.'};
const additional=[{...event,id:2,title:'Second ranked activity',upvotes:5,downvotes:1,wasUpvoted:false},{...event,id:3,title:'Third ranked activity',upvotes:1,downvotes:0,wasUpvoted:false},{...event,id:4,title:'Fourth ranked activity',upvotes:0,downvotes:0,wasUpvoted:false}];
const Feed=compile('app/components/week4-feed.tsx',{'react/jsx-runtime':jsx,'next/link':{default:Link},'@/lib/week4/data':{events:async()=>({data:[event,...additional],user:{id:'demo'},now:clock})},'@/lib/week4/types':types,'./week4-shell':{default:({children})=>children},'./week4-event':{default:EventCard}}).default;
async function html(previous,extra={}){return renderToStaticMarkup(await Feed({previous,...extra}));}
check((await html(false)).includes(event.title)&&(await html(true)).includes(event.title),'Confirmed upcoming activity is trackable');
let markup=await html(false);check(markup.includes('Hosting confirmed')&&markup.includes('Upcoming')&&markup.includes('Voting open'),'Confirmed upcoming activity remains open to votes');
clock=Date.parse(event.starts_at);markup=await html(true);check(markup.includes('Ongoing')&&markup.includes('Voting open'),'At start activity becomes ongoing, votes remain open');
clock=types.eventEnd(event);check(!(await html(false)).includes(event.title)&&(await html(true)).includes(event.title),'At exact end activity moves out of Home');
markup=await html(true);check(markup.includes('Ended')&&markup.includes('Final up 4 down 2')&&markup.includes('Join the voice channel.'),'Ended event retains final scores and hosting details');
clock=Date.parse('2026-10-16T19:00:00Z');markup=await html(false,{sort:'popular'});check(markup.includes('Popular #1')&&markup.includes('Popular #2')&&markup.includes('Popular #3')&&!markup.includes('Popular #4'),'Popular badges only for top three');check(markup.indexOf('Second ranked activity')<markup.indexOf('Boundary activity'),'Net-score ranking');
markup=await html(true,{view:'upvoted'});check(markup.includes(event.title)&&!markup.includes('Second ranked activity'),'Personal upvote history filter');
event.hosting_status='undecided';check((await html(true,{view:'upvoted'})).includes('Not confirmed'),'Supported unconfirmed activity remains trackable');
event.hosting_status='cancelled';check(!(await html(false)).includes(event.title)&&(await html(true,{view:'upvoted'})).includes('Cancelled'),'Cancelled activity removed from Home but remains in history');
event.hosting_status='confirmed';
markup=await html(false);check(markup.includes('Popular #1')&&markup.indexOf('Second ranked activity')<markup.indexOf('Boundary activity'),'Popular is default');
markup=await html(false,{sort:'latest'});check(!markup.includes('Popular #1'),'Latest has no ranking badge');
markup=await html(true);check(markup.includes('Upvoted')&&markup.includes('All Previous')&&markup.indexOf('Upvoted')<markup.indexOf('All Previous'),'Two ordered activity rows');
check(markup.includes('overflow-x-auto'),'Activity rows scroll horizontally');
console.log('Organizer statuses, end boundaries, default Popular and horizontal Upvoted / All Previous rows: PASS');
