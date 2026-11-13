import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const names = [
  'Sentinela D’Ouro',
  'Agressor da Moda',
  'Ambidestro (Ruim com as Duas)',
  'Categoria Epstein',
  'Resenha do Ano',
  'Mão Fechada',
  'Advogado do Diabo',
  'Bobo da Corte',
  'Inimigo da Pressa',
  'Rei do Java',
  'Vereador da Galera',
  'Apelido do Ano',
  'Prato Montado, Barriga Cheia (Menção Honrosa)',
];

mkdirSync('data', { recursive: true });
const db = new DatabaseSync(path.resolve('data/sentinela.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000');
const existing = db.prepare('SELECT id,status FROM polls WHERE title=? ORDER BY rowid DESC LIMIT 1').get('Sentinela Awards 2026');
if (existing) {
  const total = db.prepare('SELECT count(*) AS n FROM categories WHERE poll_id=?').get(existing.id).n;
  if (total > 0 || existing.status !== 'draft') {
    console.log(`Premiação já cadastrada: ${existing.id} (${total} categorias). Nada alterado.`);
    db.close();
    process.exit(0);
  }
}
const id = existing?.id ?? randomUUID();
db.exec('BEGIN IMMEDIATE');
try {
  if (!existing) db.prepare('INSERT INTO polls(id,title,description) VALUES (?,?,?)').run(id,'Sentinela Awards 2026','A premiação da nossa resenha.');
  names.forEach((name,i) => {
    const categoryId = randomUUID();
    db.prepare('INSERT INTO categories(id,poll_id,name,image,display_order,source_category_id) VALUES (?,?,?,NULL,?,NULL)').run(categoryId,id,name,i);
    ['Opção A','Opção B','Opção C','Opção D'].forEach((option,j) =>
      db.prepare('INSERT INTO options(id,category_id,name,image,display_order) VALUES (?,?,?,NULL,?)').run(randomUUID(),categoryId,option,j));
  });
  db.exec('COMMIT');
  console.log(`Premiação cadastrada: ${id} (${names.length} categorias, quatro opções cada).`);
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}
