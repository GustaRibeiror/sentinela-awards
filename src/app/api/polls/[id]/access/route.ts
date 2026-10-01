import { pool } from '@/lib/db';
import { canVote } from '@/lib/data';
import { bad, rateLimit, sameOrigin, tokenHash } from '@/lib/security';
import { z } from 'zod';
type Ctx={params:Promise<{id:string}>};
export async function POST(req:Request,{params}:Ctx){if(!await sameOrigin(req))return bad('Origem inválida.',403);if(!await rateLimit(req,'access',12,900))return bad('Muitas tentativas. Tente mais tarde.',429);const {id}=await params;const v=z.object({token:z.string().min(8).max(32)}).safeParse(await req.json().catch(()=>null));if(!z.uuid().safeParse(id).success||!v.success)return bad('Código inválido.');const r=await pool.query('SELECT t.used,p.status,p.starts_at,p.ends_at FROM access_tokens t JOIN polls p ON p.id=t.poll_id WHERE t.poll_id=$1 AND t.token_hash=$2',[id,tokenHash(v.data.token)]);const row=r.rows[0];if(!row)return bad('Código inválido.',401);if(row.used)return bad('Este código já foi utilizado.',409);if(!canVote(row))return bad('A votação não está aberta.',403);return Response.json({ok:true})}
