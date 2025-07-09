export interface WatchlistItem {
  id: number;
  symbol: string;
  name?: string | null;
  exchange?: string | null;
  provider: string;
  addedAt: Date;
}

export type SymbolResult = {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
};