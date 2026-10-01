export const DEMO_ID='00000000-0000-4000-8000-000000000001';
export const demoPoll={
 id:DEMO_ID,title:'Premiação 2026',description:'Uma celebração das histórias, dos lances e das pessoas do nosso grupo.',status:'open',starts_at:null,ends_at:null,results_released:false,reveal_at:null,
 categories:[
  {id:'00000000-0000-4000-8000-000000000011',name:'Melhor jogador',options:[{id:'00000000-0000-4000-8000-000000000101',name:'João',votes:6},{id:'00000000-0000-4000-8000-000000000102',name:'Pedro',votes:3},{id:'00000000-0000-4000-8000-000000000103',name:'Lucas',votes:1}]},
  {id:'00000000-0000-4000-8000-000000000012',name:'Mais resenha',options:[{id:'00000000-0000-4000-8000-000000000104',name:'Thiago',votes:5},{id:'00000000-0000-4000-8000-000000000105',name:'Carlos',votes:3},{id:'00000000-0000-4000-8000-000000000106',name:'João',votes:2}]},
  {id:'00000000-0000-4000-8000-000000000013',name:'Mais atrasado',options:[{id:'00000000-0000-4000-8000-000000000107',name:'Pedro',votes:4},{id:'00000000-0000-4000-8000-000000000108',name:'Lucas',votes:4},{id:'00000000-0000-4000-8000-000000000109',name:'Carlos',votes:2}]}
 ]
};
export const isDemo=()=>process.env.DEMO_MODE==='true';
