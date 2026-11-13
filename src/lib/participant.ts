import { cookies } from 'next/headers';
import { db } from './db';
import { hash, required } from './security';

export type Participant={id:string;poll_id:string;full_name:string};
export const cookieName=(pollId:string)=>`voter_${pollId}`;
export async function participantFor(pollId:string):Promise<Participant|undefined>{
 const credential=(await cookies()).get(cookieName(pollId))?.value;
 if(!credential||!/^[a-f0-9]{64}$/.test(credential))return undefined;
 return db.prepare('SELECT id,poll_id,full_name FROM participants WHERE poll_id=? AND credential_hash=?').get(pollId,hash(credential,required('SESSION_SECRET'))) as Participant|undefined;
}
