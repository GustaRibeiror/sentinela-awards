import pg from 'pg';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente');
const client = new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {
 await client.query('BEGIN');
 const p=await client.query("INSERT INTO polls(title,description,status) VALUES ($1,$2,'draft') RETURNING id",['Premiação 2026','Uma celebração das histórias e pessoas do nosso grupo.']);
 for (const [i,[name,choices]] of [['Melhor jogador',['João','Pedro','Lucas']],['Mais resenha',['João','Carlos','Thiago']],['Mais atrasado',['Pedro','Lucas','Carlos']]].entries()) {
  const c=await client.query('INSERT INTO categories(poll_id,name,display_order) VALUES ($1,$2,$3) RETURNING id',[p.rows[0].id,name,i]);
  for (const [j,choice] of choices.entries()) await client.query('INSERT INTO options(category_id,name,display_order) VALUES ($1,$2,$3)',[c.rows[0].id,choice,j]);
 }
 await client.query('COMMIT'); console.log(`Votação de exemplo criada: ${p.rows[0].id}`);
} catch(e){await client.query('ROLLBACK');throw e} finally {await client.end()}
