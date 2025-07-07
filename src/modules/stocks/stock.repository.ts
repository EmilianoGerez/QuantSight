// src/modules/stocks/stock.repository.ts
import pool from "@/infrastructure/db/db";
import { IStockRepository } from "./interfaces";
import { StockPrice } from "./types";

export class StockRepository implements IStockRepository {
  async insertMany(prices: StockPrice[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const p of prices) {
        await client.query(
          `INSERT INTO stock_prices (symbol, date, open, high, low, close, volume)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (symbol, date) DO NOTHING`,
          [p.symbol, p.date, p.open, p.high, p.low, p.close, p.volume]
        );
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getHistorical(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<StockPrice[]> {
    let query = `SELECT * FROM stock_prices WHERE symbol = $1`;
    const params: any[] = [symbol];
    if (from) {
      query += ` AND date >= $2`;
      params.push(from);
    }
    if (to) {
      query += from ? ` AND date <= $3` : ` AND date <= $2`;
      params.push(to);
    }
    query += ` ORDER BY date ASC`;

    const res = await pool.query(query, params);
    return res.rows;
  }
}
