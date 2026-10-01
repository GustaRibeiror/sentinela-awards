import Image from 'next/image';
import { demoPoll, isDemo } from '@/lib/demo';
import { getPoll, canVote } from '@/lib/data';
import VoteForm from './vote-form';
import { notFound } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const demo=isDemo()&&id===demoPoll.id;const p=demo?demoPoll:await getPoll(id).catch(()=>null);if(!p||p.status==='draft')notFound();return <main id="main" className="shell narrow">{demo&&<div className="demo-banner">MODO DEMONSTRAÇÃO · qualquer código com 8 caracteres funciona</div>}<div className="page-intro ceremony-intro"><div className="inner-cover"><Image src="/images/sentinela-espelho.png" alt="Integrante da turma tirando uma foto no espelho" fill sizes="(max-width: 800px) 100vw, 36vw"/></div><a href="/" className="back">← TODAS AS VOTAÇÕES</a><p className="eyebrow">SEU VOTO É SECRETO</p><h1>{p.title}</h1><p>{p.description}</p></div>{canVote(p)?<VoteForm pollId={id} categories={p.categories} demo={demo}/>:<div className="notice">Esta votação não está aberta no momento. <a href={`/results/${id}`}>Acompanhar resultados →</a></div>}</main>}
