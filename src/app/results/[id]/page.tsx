import Image from 'next/image';
import { demoPoll, isDemo } from '@/lib/demo';
import Results from './results';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <main id="main" className="shell narrow"><>{isDemo()&&id===demoPoll.id&&<div className="demo-banner">MODO DEMONSTRAÇÃO · resultados de exemplo</div>}<div className="results-photo-rail"><div><Image src="/images/sentinela-grupo.png" alt="Foto em grupo da turma Sentinela" fill sizes="(max-width: 800px) 100vw, 50vw"/></div><span>✦ THE SENTINELA AWARDS · 2026</span></div><Results pollId={id} demo={isDemo()&&id===demoPoll.id}/></></main>}
