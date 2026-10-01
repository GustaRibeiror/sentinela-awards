import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { pool } from './db';
export function hash(value:string, secret:string) { return createHmac('sha256',secret).update(value).digest('hex'); }
export function tokenHash(token:string) { return hash(token.toUpperCase().replace(/[^A-Z0-9]/g,''),required('TOKEN_PEPPER')); }
export function required(name:string) { const v=process.env[name]; if(!v) throw new Error(`${name} ausente`); return v; }
export function makeToken() { const s=randomBytes(6).toString('hex').toUpperCase(); return `${s.slice(0,4)}-${s.slice(4,8)}-${s.slice(8,12)}`; }
export function safeEqual(a:string,b:string) { const x=Buffer.from(a), y=Buffer.from(b); return x.length===y.length && timingSafeEqual(x,y); }
export async function isAdmin() { const c=(await cookies()).get('admin_session')?.value; if(!c) return false; const [exp,sig]=c.split('.'); if(!exp||!sig||Number(exp)<Date.now()) return false; return safeEqual(sig,hash(exp,required('SESSION_SECRET'))); }
export function adminCookie() { const exp=String(Date.now()+1000*60*60*12); return `${exp}.${hash(exp,required('SESSION_SECRET'))}`; }
export async function sameOrigin(req:Request) { const origin=req.headers.get('origin'); const host=(await headers()).get('host'); return !!origin && !!host && new URL(origin).host===host; }
export async function rateLimit(req:Request, scope:string, limit:number, windowSeconds:number) {
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
 const key=hash(`${scope}:${ip}`,required('SESSION_SECRET'));
 const r=await pool.query(`INSERT INTO rate_limits(key_hash,hits,reset_at) VALUES ($1,1,now()+($2::text || ' seconds')::interval)
 ON CONFLICT (key_hash) DO UPDATE SET hits=CASE WHEN rate_limits.reset_at<now() THEN 1 ELSE rate_limits.hits+1 END,
 reset_at=CASE WHEN rate_limits.reset_at<now() THEN now()+($2::text || ' seconds')::interval ELSE rate_limits.reset_at END RETURNING hits`,[key,windowSeconds]);
 return r.rows[0].hits<=limit;
}
export const denied=()=>Response.json({error:'Acesso negado.'},{status:401});
export const bad=(message:string,status=400)=>Response.json({error:message},{status});
