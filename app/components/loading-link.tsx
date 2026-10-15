'use client';
import Link,{useLinkStatus} from 'next/link';
import type {ComponentProps} from 'react';
import {Spinner} from './loading-indicator';
function NavigationLoading(){
 const {pending}=useLinkStatus();
 if(!pending)return null;
 return <span role="status" className="navigation-loading ml-auto inline-flex shrink-0 items-center pl-2 align-middle"><Spinner className="h-4 w-4"/><span className="sr-only">Loading…</span></span>;
}
export default function LoadingLink({children,onClick,...props}:ComponentProps<typeof Link>){
 return <Link {...props} onClick={event=>{
  onClick?.(event);
  if(!event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&event.currentTarget.href===window.location.href)event.preventDefault();
 }}>{children}<NavigationLoading/></Link>;
}
