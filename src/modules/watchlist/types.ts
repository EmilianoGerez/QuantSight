export interface WatchlistItem {
  id: number;
  symbol: string;
  name?: string;
  exchange?: string;
  provider: string;
  added_at: string;
}

export type SymbolResult = {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
};