// src/repositories/signals.ts
import pool from "@/lib/db";
import { Signal } from "./types";
import { ISignalRepository } from "./interfaces";

export class SignalRepository implements ISignalRepository {
  async insert(signal: {
    symbol: string;
    name: string;
    detail?: string;
    created_at: string;
  }) {
    await pool.query(
      `INSERT INTO signals (symbol, name, detail, created_at)
     VALUES ($1, $2, $3, $4)`,
      [signal.symbol, signal.name, signal.detail ?? null, signal.created_at]
    );
  }

  async getRecent(limit = 20, symbol?: string): Promise<Signal[]> {
    const params: (string | number | null)[] = [];
    let query = `SELECT * FROM signals`;

    if (symbol) {
      query += ` WHERE symbol = $1`;
      params.push(symbol);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      detail: row.detail,
      created_at: row.created_at,
      date: row.date ?? row.created_at, // fallback if date is not present
      type: row.type ?? '', // provide default or map accordingly
      description: row.description ?? '', // provide default or map accordingly
    }));
  }

  async exists(
    symbol: string,
    name: string,
    createdAt: string
  ): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM signals WHERE symbol = $1 AND name = $2 AND created_at::date = $3::date LIMIT 1`,
      [symbol, name, createdAt]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
