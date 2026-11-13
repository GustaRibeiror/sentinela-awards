import LiveRoom from './room';
import { headers } from 'next/headers';
import { networkInterfaces } from 'node:os';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const host=(await headers()).get('host')||'localhost:3000';
 const [hostname,port]=host.split(':');
 const addresses=Object.entries(networkInterfaces()).flatMap(([name,items])=>(items||[]).filter(item=>item.family==='IPv4'&&!item.internal).map(item=>({name,address:item.address})));
 const lan=addresses.find(item=>item.name==='en0')||addresses.find(item=>/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address))||addresses[0];
 const target=/^(localhost|127\.0\.0\.1)$/.test(hostname)?lan?.address:hostname;
 const joinUrl=target?`http://${target}${port?`:${port}`:''}/polls/${id}`:'';
 return <main id="main" className="shell"><LiveRoom id={id} suggestedJoinUrl={joinUrl}/></main>;
}
