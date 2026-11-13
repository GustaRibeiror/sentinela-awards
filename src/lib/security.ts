import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';
export function hash(value:string, secret:string) { return createHmac('sha256',secret).update(value).digest('hex'); }
export function required(name:string) { const v=process.env[name]; if(!v) throw new Error(`${name} ausente`); return v; }
export function safeEqual(a:string,b:string) { const x=Buffer.from(a), y=Buffer.from(b); return x.length===y.length && timingSafeEqual(x,y); }
export async function isAdmin() { const c=(await cookies()).get('admin_session')?.value; if(!c) return false; const [exp,sig]=c.split('.'); if(!exp||!sig||Number(exp)<Date.now()) return false; return safeEqual(sig,hash(exp,required('SESSION_SECRET'))); }
export function adminCookie() { const exp=String(Date.now()+1000*60*60*12); return `${exp}.${hash(exp,required('SESSION_SECRET'))}`; }
export async function sameOrigin(req:Request) { const origin=req.headers.get('origin'),host=req.headers.get('host'); if(!origin||!host)return false;try{return new URL(origin).host===host}catch{return false} }
export async function rateLimit(req:Request, scope:string, limit:number, windowSeconds:number) {
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
 const key=hash(`${scope}:${ip}`,required('SESSION_SECRET'));
 const now=Date.now();const old=db.prepare('SELECT hits,reset_at FROM rate_limits WHERE key_hash=?').get(key) as {hits:number;reset_at:number}|undefined;
 const hits=old&&old.reset_at>now?old.hits+1:1;
 db.prepare('INSERT INTO rate_limits VALUES (?,?,?) ON CONFLICT(key_hash) DO UPDATE SET hits=excluded.hits,reset_at=excluded.reset_at').run(key,hits,old&&old.reset_at>now?old.reset_at:now+windowSeconds*1000);
 return hits<=limit;
}
export const denied=()=>Response.json({error:'Acesso negado.'},{status:401});
export const bad=(message:string,status=400)=>Response.json({error:message},{status});
