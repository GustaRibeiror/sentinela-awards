import { bad, sameOrigin } from '@/lib/security';
export async function POST(req:Request) {if(!await sameOrigin(req)) return bad('Origem inválida.',403);const res=Response.json({ok:true});res.headers.append('Set-Cookie','admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return res}
