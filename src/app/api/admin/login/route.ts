import { adminCookie, bad, rateLimit, required, safeEqual, sameOrigin } from '@/lib/security';
export async function POST(req:Request) {
 if(!await sameOrigin(req)) return bad('Origem inválida.',403);
 if(!await rateLimit(req,'admin-login',6,900)) return bad('Muitas tentativas. Tente mais tarde.',429);
 const body=await req.json().catch(()=>({}));
 if(typeof body.password!=='string'||!safeEqual(body.password,required('ADMIN_PASSWORD'))) return bad('Senha inválida.',401);
 const res=Response.json({ok:true});res.headers.append('Set-Cookie',`admin_session=${adminCookie()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200; ${process.env.NODE_ENV==='production'?'Secure;':''}`);return res;
}
