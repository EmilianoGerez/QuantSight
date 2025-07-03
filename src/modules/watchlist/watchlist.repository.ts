import pool from "@/lib/db";
import { WatchlistItem } from "./types";

export class WatchlistRepository {
  async getAll(): Promise<WatchlistItem[]> {
    const result = await pool.query("SELECT * FROM watchlist ORDER BY added_at DESC");
    return result.rows;
  }

  async add(symbol: string, name?: string, exchange?: string, provider = "yahoo"): Promise<void> {
    await pool.query(
      `INSERT INTO watchlist (symbol, name, exchange, provider)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (symbol) DO NOTHING`,
      [symbol.toUpperCase(), name || null, exchange || null, provider]
    );
  }

  async remove(symbol: string): Promise<void> {
    await pool.query(`DELETE FROM watchlist WHERE symbol = $1`, [symbol.toUpperCase()]);
  }
}