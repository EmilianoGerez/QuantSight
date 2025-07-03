import { Signal } from "./types";

export interface ISignalRepository {
  insert(signal: {
    symbol: string;
    name: string;
    detail?: string;
    created_at: string;
  }): Promise<void>;
  getRecent(limit?: number, symbol?: string): Promise<Signal[]>;
  exists(symbol: string, name: string, createdAt: string): Promise<boolean>;
}
