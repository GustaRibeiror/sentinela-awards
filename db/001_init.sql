CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS polls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 160), description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','closed')),
 starts_at timestamptz, ends_at timestamptz, results_released boolean NOT NULL DEFAULT false, reveal_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);
CREATE TABLE IF NOT EXISTS categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
 name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120), display_order integer NOT NULL DEFAULT 0,
 UNIQUE (id,poll_id)
);
CREATE INDEX IF NOT EXISTS categories_poll_order ON categories(poll_id,display_order,id);
CREATE TABLE IF NOT EXISTS options (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
 name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120), display_order integer NOT NULL DEFAULT 0,
 UNIQUE (id,category_id)
);
CREATE INDEX IF NOT EXISTS options_category_order ON options(category_id,display_order,id);
CREATE TABLE IF NOT EXISTS votes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category_id uuid NOT NULL, option_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT date_trunc('day', now()),
 FOREIGN KEY (option_id,category_id) REFERENCES options(id,category_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS votes_category_option ON votes(category_id,option_id);
CREATE TABLE IF NOT EXISTS access_tokens (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, used boolean NOT NULL DEFAULT false, used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((used AND used_at IS NOT NULL) OR (NOT used AND used_at IS NULL))
);
CREATE INDEX IF NOT EXISTS access_tokens_poll ON access_tokens(poll_id,used);
CREATE TABLE IF NOT EXISTS rate_limits (
 key_hash text PRIMARY KEY, hits integer NOT NULL, reset_at timestamptz NOT NULL
);
