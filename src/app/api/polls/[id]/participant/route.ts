import { db,transaction } from '@/lib/db';
import { poll } from '@/lib/live';
import { cookieName,participantFor } from '@/lib/participant';
import { bad,hash,rateLimit,required,sameOrigin } from '@/lib/security';
import { randomBytes,randomUUID } from 'node:crypto';
type Ctx={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Ctx){const {id}=await params;if(!poll(id))return bad('Premiação não encontrada.',404);const person=await participantFor(id);return Response.json({name:person?.full_name||null},{headers:{'Cache-Control':'no-store'}});}
export async function POST(req:Request,{params}:Ctx){if(!await sameOrigin(req))return bad('Origem inválida.',403);if(!await rateLimit(req,'participant',25,900))return bad('Muitas tentativas. Aguarde um pouco.',429);const {id}=await params;const p=poll(id);if(!p||p.status==='closed')return bad('Premiação indisponível.',403);const body=await req.json().catch(()=>null);const name=typeof body?.name==='string'?body.name.normalize('NFKC').trim().replace(/\s+/g,' '):'';
 if(name.length<5||name.length>100||name.split(' ').length<2||!/^\p{L}[\p{L}\p{M}'’.-]*(?: \p{L}[\p{L}\p{M}'’.-]*)+$/u.test(name))return bad('Digite nome e sobrenome completos.');
 const known=await participantFor(id);if(known)return known.full_name===name?Response.json({name}):bad(`Este aparelho já está cadastrado como ${known.full_name}.`,409);
 const key=name.toLocaleLowerCase('pt-BR');const credential=randomBytes(32).toString('hex');
 try{transaction(()=>{const taken=db.prepare('SELECT 1 FROM participants WHERE poll_id=? AND name_key=?').get(id,key);if(taken)throw Error('Este nome já está cadastrado em outro aparelho. Fale com o host.');db.prepare('INSERT INTO participants(id,poll_id,full_name,name_key,credential_hash) VALUES (?,?,?,?,?)').run(randomUUID(),id,name,key,hash(credential,required('SESSION_SECRET')));});}catch(e){return bad(e instanceof Error?e.message:'Não foi possível cadastrar.',409)}
 const res=Response.json({name});res.headers.append('Set-Cookie',`${cookieName(id)}=${credential}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000; ${new URL(req.url).protocol==='https:'?'Secure;':''}`);return res;
}
