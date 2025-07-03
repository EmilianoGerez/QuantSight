-- migration: 2025XXXXXX_add_unique_index_signals.sql
CREATE TABLE IF NOT EXISTS signals (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL, 
  detail TEXT,
  created_at TIMESTAMP NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  scored NUMERIC DEFAULT 1.0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_signals_unique
  ON signals (symbol, name, created_at);
