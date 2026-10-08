import Feed from './components/week4-feed';
export const metadata={title:'Campus plans | Home'};
export default async function Home({searchParams}:{searchParams:Promise<{sort?:string}>}){return <Feed sort={(await searchParams).sort}/>;}
