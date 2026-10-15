import Feed from './components/week4-feed';
export const metadata={title:'Campus plans | Home'};
export default async function Home({searchParams}:{searchParams:Promise<{sort?:string;view?:string;host?:string;format?:string;tag?:string}>}){const params=await searchParams;return <Feed sort={params.sort} previous={params.view==='history'} host={params.host} format={params.format} tag={params.tag}/>;}
