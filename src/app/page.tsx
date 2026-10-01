import Image from 'next/image';
import { demoPoll, isDemo } from '@/lib/demo';
import { pool } from '@/lib/db';

export const dynamic='force-dynamic';

const archive = [
  {src:'/images/sentinela-retrato.png',alt:'Retrato de um integrante da turma com camisa branca',label:'RETRATOS DA TEMPORADA',kind:'portrait'},
  {src:'/images/sentinela-resenha.png',alt:'Close descontraído de um integrante da turma',label:'MOMENTOS INESQUECÍVEIS',kind:'close'},
  {src:'/images/sentinela-arquivo.png',alt:'Foto antiga de um integrante da turma sorrindo',label:'DO FUNDO DO BAÚ',kind:'archive'},
  {src:'/images/sentinela-espelho.png',alt:'Integrante da turma tirando uma foto no espelho',label:'MOMENTO DE ESTRELA',kind:'wide'},
];

export default async function Home(){
 const demo=isDemo();
 const r=demo?{rows:[{...demoPoll,participants:10,voted:8}]}:await pool.query(`SELECT p.id,p.title,p.description,p.status,p.starts_at,p.ends_at,count(t.id)::int participants,count(t.id) FILTER (WHERE t.used)::int voted FROM polls p LEFT JOIN access_tokens t ON t.poll_id=p.id WHERE p.status <> 'draft' GROUP BY p.id ORDER BY p.created_at DESC`);
 return <main id="main" className="shell awards-home">
  {demo&&<div className="demo-banner">MODO DEMONSTRAÇÃO · dados de exemplo, sem banco de dados</div>}
  <section className="awards-hero" aria-labelledby="hero-title">
   <div className="awards-hero-copy">
    <div className="ceremony-kicker"><span className="small-star">✦</span> A CERIMÔNIA DA NOSSA RESENHA <span>2026</span></div>
    <h1 id="hero-title">Toda resenha<br/>merece seu <em>Oscar.</em></h1>
    <p>As histórias viraram categorias. Os protagonistas, indicados. E agora chegou a hora da turma decidir quem leva a glória.</p>
    <div className="hero-actions"><a className="button" href="#votacoes">Começar a votação <span>↗</span></a><a className="hero-secondary" href="#arquivo">Conheça o arquivo <span>↓</span></a></div>
    <div className="hero-footnote"><span>✦</span><span>UMA NOITE. MUITAS HISTÓRIAS.<br/>NENHUM VOTO REVELADO.</span></div>
   </div>
   <div className="awards-hero-art" aria-label="Fotos da turma Sentinela">
    <div className="hero-halo"/>
    <div className="hero-photo-main"><Image src="/images/sentinela-grupo.png" alt="Foto em grupo de integrantes do Sentinela" fill priority sizes="(max-width: 800px) 82vw, 42vw"/></div>
    <div className="hero-photo-side"><Image src="/images/sentinela-bicicleta.png" alt="Integrante do Sentinela sorrindo em uma bicicleta" fill sizes="(max-width: 800px) 42vw, 17vw"/></div>
    <div className="hero-stamp"><span>✦</span><strong>SENTINELA<br/>AWARDS</strong><small>EDIÇÃO 2026</small></div>
    <div className="hero-art-caption">O ELENCO PRINCIPAL · TEMPORADA 2026</div>
   </div>
  </section>
  <div className="marquee-rule" aria-hidden="true"><span>✦</span> INDICADOS PELA HISTÓRIA <span>✦</span> ELEITOS PELA TURMA <span>✦</span> LEMBRADOS PELA RESENHA <span>✦</span></div>
  <section className="ballot-section" id="votacoes" aria-labelledby="ballot-title">
   <div className="section-heading awards-heading"><span>01 / A VOTAÇÃO</span><div><p className="section-overline">O PODER ESTÁ COM VOCÊ</p><h2 id="ballot-title">Escolha os seus <em>favoritos.</em></h2></div></div>
   <div className="poll-grid">{r.rows.length?r.rows.map(p=><article className="poll-card awards-poll-card" key={p.id}><div className="card-top"><span className="status-dot"/> {p.status==='open'?'VOTAÇÃO ABERTA':'VOTAÇÃO ENCERRADA'} <span className="card-arrow">✦</span></div><div className="poll-card-content"><p className="poll-card-edition">A GRANDE PREMIAÇÃO · 2026</p><h3>{p.title}</h3><p>{p.description}</p></div><div className="card-meta"><span>{p.voted} / {p.participants} PARTICIPARAM</span><span>SEU VOTO É SECRETO</span></div><div className="card-actions"><a className="button" href={`/polls/${p.id}`}>Acessar votação <span>↗</span></a><a className="text-link" href={`/results/${p.id}`}>Ver resultados →</a></div></article>):<div className="empty">Ainda não há votações abertas ou encerradas. O administrador pode criar uma em /admin.</div>}
    <div className="poll-companion"><div className="companion-photo"><Image src="/images/sentinela-bicicleta.png" alt="Integrante da turma sorrindo em uma bicicleta" fill sizes="(max-width: 800px) 100vw, 40vw"/></div><div className="companion-overlay"><span>PRÊMIO DE RESENHA DO ANO</span><strong>O palco é<br/>de vocês.</strong><span>✦ SENTINELA AWARDS</span></div></div>
   </div>
  </section>
  <section className="archive-section" id="arquivo" aria-labelledby="archive-title">
   <div className="section-heading awards-heading"><span>02 / O ARQUIVO</span><div><p className="section-overline">ANTES DOS TROFÉUS, AS HISTÓRIAS</p><h2 id="archive-title">O elenco da <em>resenha.</em></h2></div></div>
   <p className="archive-intro">Um pedacinho da nossa história em imagens. Porque toda grande premiação começa com quem fez os momentos acontecerem.</p>
   <div className="archive-grid">{archive.map((photo,i)=><figure className={`archive-card archive-${photo.kind}`} key={photo.src}><div className="archive-image"><Image src={photo.src} alt={photo.alt} fill sizes={photo.kind==='wide'?'(max-width: 800px) 100vw, 48vw':'(max-width: 800px) 50vw, 24vw'}/></div><figcaption><span>{String(i+1).padStart(2,'0')} / {photo.label}</span><span>✦</span></figcaption></figure>)}</div>
  </section>
  <section className="closing-cta"><span>✦ A NOITE É NOSSA ✦</span><h2>Que vença a melhor <em>história.</em></h2><p>O resultado fica em segredo até a hora certa. A zoeira, essa pode começar agora.</p><a className="button" href="#votacoes">Ir para a votação ↗</a></section>
 </main>
}
