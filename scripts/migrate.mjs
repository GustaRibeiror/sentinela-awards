import pg from 'pg';
import fs from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente');
const client = new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {
 await client.query('BEGIN');
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
 for(const name of (await fs.readdir('db')).filter(x=>x.endsWith('.sql')).sort()) {
  const done=await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
  if(done.rowCount) continue;
  await client.query(await fs.readFile(`db/${name}`,'utf8'));
  await client.query('INSERT INTO schema_migrations(name) VALUES ($1)',[name]);
  console.log(`Aplicada: ${name}`);
 }
 await client.query('COMMIT');
} catch(e){await client.query('ROLLBACK');throw e} finally {await client.end()}
