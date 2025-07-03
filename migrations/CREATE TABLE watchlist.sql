CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT,
  exchange TEXT,
  provider TEXT DEFAULT 'yahoo',
  added_at TIMESTAMPTZ DEFAULT NOW()
);
