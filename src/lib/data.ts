import { pool } from './db';
export async function getPoll(id:string) {
 const p=await pool.query('SELECT * FROM polls WHERE id=$1',[id]); if(!p.rows[0]) return null;
 const c=await pool.query('SELECT * FROM categories WHERE poll_id=$1 ORDER BY display_order,id',[id]);
 const o=await pool.query('SELECT o.* FROM options o JOIN categories c ON c.id=o.category_id WHERE c.poll_id=$1 ORDER BY o.display_order,o.id',[id]);
 return {...p.rows[0],categories:c.rows.map(x=>({...x,options:o.rows.filter(y=>y.category_id===x.id)}))};
}
export function canVote(p:{status:string;starts_at:Date|null;ends_at:Date|null}) {const now=Date.now();return p.status==='open'&&(!p.starts_at||new Date(p.starts_at).getTime()<=now)&&(!p.ends_at||new Date(p.ends_at).getTime()>now)}
export function revealed(p:{results_released:boolean;reveal_at:Date|null}) {return p.results_released||!!p.reveal_at&&new Date(p.reveal_at).getTime()<=Date.now()}
