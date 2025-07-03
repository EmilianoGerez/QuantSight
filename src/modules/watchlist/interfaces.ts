import { WatchlistItem } from "./types";

export interface IWatchlistRepository {
  getAll(): Promise<WatchlistItem[]>;
  add(symbol: string, name?: string, exchange?: string, provider?: string): Promise<void>;
  remove(symbol: string): Promise<void>;
}