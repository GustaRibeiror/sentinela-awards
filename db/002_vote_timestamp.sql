-- Keep vote timestamps at day precision so they cannot be matched to token usage times.
ALTER TABLE votes ALTER COLUMN created_at SET DEFAULT date_trunc('day', now());
UPDATE votes SET created_at = date_trunc('day', created_at) WHERE created_at <> date_trunc('day', created_at);
