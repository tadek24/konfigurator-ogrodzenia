import Workspace from '@/components/workspace';
export default async function Page({searchParams}:{searchParams:Promise<{produkt?:string}>}){const params=await searchParams;return <Workspace startDrawing initialProductId={params.produkt}/>;}
