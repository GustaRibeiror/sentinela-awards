import assert from 'node:assert/strict';
const base=process.env.TEST_BASE||'http://127.0.0.1:3100';
let adminCookie='',voterCookie='',id='';
async function call(path,method='GET',body,cookie=''){const response=await fetch(base+path,{method,headers:{origin:base,...(cookie?{cookie}:{}),...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]||''};}
async function action(value){const result=await call(`/api/admin/polls/${id}`,'PATCH',{action:value},adminCookie);assert.equal(result.status,200,`${value}: ${JSON.stringify(result.data)}`);}
try{
 const login=await call('/api/admin/login','POST',{password:process.env.ADMIN_PASSWORD});assert.equal(login.status,200);adminCookie=login.cookie;
 const created=await call('/api/admin/polls','POST',{title:'Teste temporário',description:''},adminCookie);assert.equal(created.status,201);id=created.data.id;
 const setup=await call(`/api/admin/polls/${id}`,'PUT',{title:'Teste temporário',description:'',categories:[{name:'Categoria A',image:null,options:[{name:'Um',image:null},{name:'Dois',image:null}]}]},adminCookie);assert.equal(setup.status,200);
 const detail=(await call(`/api/admin/polls/${id}`,'GET',null,adminCookie)).data;const category=detail.categories[0];
 const entry=await call(`/api/polls/${id}/participant`,'POST',{name:'Ana Maria'});assert.equal(entry.status,200);voterCookie=entry.cookie;assert.ok(voterCookie);
 assert.equal((await call(`/api/polls/${id}/participant`,'POST',{name:'Ana Maria'})).status,409,'nome duplicado em outro aparelho');
 assert.equal((await call(`/api/polls/${id}/participant`,'GET',null,voterCookie)).data.name,'Ana Maria');
 const vote=option=>call(`/api/polls/${id}/vote`,'POST',{categoryId:category.id,optionId:option.id},voterCookie);
 assert.equal((await vote(category.options[0])).status,409,'voto antecipado');await action('start');await action('candidates');await action('open');
 assert.equal((await vote(category.options[0])).status,200);assert.equal((await vote(category.options[1])).status,200,'troca de voto');
 assert.equal((await call(`/api/polls/${id}/vote`,'POST',{categoryId:category.id,optionId:category.options[0].id})).status,401,'voto sem identificação');
 await action('close');assert.equal((await vote(category.options[0])).status,409,'voto tardio');await action('reveal');
 assert.deepEqual((await call(`/api/polls/${id}/state?tv=1`,'GET',null,adminCookie)).data.totals.map(x=>x.votes),[0,1]);
 assert.equal((await call(`/api/polls/${id}/state?tv=1`)).data.totals,undefined,'placar público');
 console.log('PASS: nome completo, aparelho reconhecido, voto trocável, placar privado');
}finally{if(id)await call(`/api/admin/polls/${id}`,'DELETE',null,adminCookie)}
