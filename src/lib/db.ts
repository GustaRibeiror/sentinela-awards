import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
const location=path.join(process.cwd(),'data','sentinela.sqlite');
mkdirSync(path.dirname(location),{recursive:true});
const globalDb=globalThis as typeof globalThis & {sentinelaDb?:DatabaseSync};
export const db=globalDb.sentinelaDb??new DatabaseSync(location);
globalDb.sentinelaDb=db;
db.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
try { db.exec('PRAGMA journal_mode=WAL;'); } catch { /* Another build worker may set WAL concurrently. */ }
db.exec(`
CREATE TABLE IF NOT EXISTS polls (id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'draft',active_category_id TEXT,phase TEXT NOT NULL DEFAULT 'lobby',round INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY,poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,name TEXT NOT NULL,image TEXT,display_order INTEGER NOT NULL,source_category_id TEXT);
CREATE TABLE IF NOT EXISTS options (id TEXT PRIMARY KEY,category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,name TEXT NOT NULL,image TEXT,display_order INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS access_tokens (id TEXT PRIMARY KEY,poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,token_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS votes (id TEXT PRIMARY KEY,category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,option_id TEXT NOT NULL REFERENCES options(id),token_id TEXT NOT NULL REFERENCES access_tokens(id) ON DELETE CASCADE,UNIQUE(category_id,token_id));
CREATE TABLE IF NOT EXISTS participants (id TEXT PRIMARY KEY,poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,full_name TEXT NOT NULL,name_key TEXT NOT NULL,credential_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(poll_id,name_key));
CREATE TABLE IF NOT EXISTS participant_votes (id TEXT PRIMARY KEY,category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,option_id TEXT NOT NULL REFERENCES options(id),participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,UNIQUE(category_id,participant_id));
CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT PRIMARY KEY,hits INTEGER NOT NULL,reset_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS categories_poll_order ON categories(poll_id,display_order);
CREATE INDEX IF NOT EXISTS votes_category_option ON votes(category_id,option_id);`);
export function transaction<T>(fn:()=>T):T {db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
