import { db,transaction } from './db';
import { randomUUID } from 'node:crypto';
export type Phase='lobby'|'question'|'candidates'|'voting'|'closed'|'result';
export type Poll={id:string;title:string;description:string;status:string;active_category_id:string|null;phase:Phase;round:number};
export type Option={id:string;category_id:string;name:string;image:string|null;display_order:number;votes?:number};
export type Category={id:string;poll_id:string;name:string;image:string|null;display_order:number;source_category_id:string|null;options:Option[]};
export const poll=(id:string)=>db.prepare('SELECT * FROM polls WHERE id=?').get(id) as Poll|undefined;
export function categories(id:string):Category[] {const rows=db.prepare('SELECT * FROM categories WHERE poll_id=? ORDER BY display_order').all(id) as Omit<Category,'options'>[];return rows.map(c=>({...c,options:db.prepare('SELECT * FROM options WHERE category_id=? ORDER BY display_order').all(c.id) as Option[]}));}
export function current(id:string){const p=poll(id);if(!p)return null;const all=categories(id);return {poll:p,categories:all,category:all.find(c=>c.id===p.active_category_id)||null};}
export function counts(categoryId:string){return db.prepare('SELECT o.id,o.name,o.image,count(v.id) AS votes FROM options o LEFT JOIN participant_votes v ON v.option_id=o.id WHERE o.category_id=? GROUP BY o.id ORDER BY o.display_order').all(categoryId) as {id:string;name:string;image:string|null;votes:number}[];}
export function completed(categoryId:string){return (db.prepare('SELECT count(*) AS n FROM participant_votes WHERE category_id=?').get(categoryId) as {n:number}).n;}
export function tied(categoryId:string){const rows=counts(categoryId);const top=Math.max(0,...rows.map(x=>x.votes));return top>0?rows.filter(x=>x.votes===top):[];}
export function advance(id:string,action:string){return transaction(()=>{const state=current(id);if(!state)throw Error('Votação não encontrada.');const {poll:p,categories:all,category}=state;let phase=p.phase,active=p.active_category_id,status=p.status;
if(action==='start'&&phase==='lobby'&&status==='draft'&&all.length){active=all[0].id;phase='question';status='open';}
else if(action==='candidates'&&phase==='question')phase='candidates';
else if(action==='open'&&phase==='candidates')phase='voting';
else if(action==='close'&&phase==='voting')phase='closed';
else if(action==='reveal'&&phase==='closed')phase='result';
else if(action==='next'&&phase==='result'&&category){let root=category;while(root.source_category_id){const parent=all.find(c=>c.id===root.source_category_id);if(!parent)break;root=parent;}const next=all.find(c=>!c.source_category_id&&c.display_order>root.display_order);if(!next)throw Error('Não há próxima categoria.');active=next.id;phase='question';}
else if(action==='finish'&&phase==='result'){phase='lobby';active=null;status='closed';}
else if(action==='runoff'&&phase==='result'&&category){const winners=tied(category.id);if(winners.length<2)throw Error('Não há empate para desempatar.');const cid=randomUUID(),order=Math.max(...all.map(c=>c.display_order))+1;db.prepare('INSERT INTO categories VALUES (?,?,?,?,?,?)').run(cid,id,category.name,category.image,order,category.id);winners.forEach((o,i)=>db.prepare('INSERT INTO options VALUES (?,?,?,?,?)').run(randomUUID(),cid,o.name,o.image,i));active=cid;phase='question';db.prepare('UPDATE polls SET round=round+1 WHERE id=?').run(id);}
else throw Error('Ação não permitida nesta etapa.');
db.prepare('UPDATE polls SET phase=?,active_category_id=?,status=? WHERE id=?').run(phase,active,status,id);return {phase,active};});}
