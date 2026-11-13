import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Sentinela Awards',description:'Premiação ao vivo entre amigos'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><a className="skip" href="#main">Ir para o conteúdo</a><header className="site-header"><a href="/" className="brand"><span className="brand-face" aria-hidden="true"/> <span>SENTINELA <span className="brand-light">AWARDS</span></span></a><nav><a href="/">Votações</a><a href="/admin">Admin</a></nav></header>{children}<footer>FEITO PARA ESCOLHAS QUE MERECEM UMA REVELAÇÃO.</footer></body></html>}
