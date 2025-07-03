import { StockPrice } from "./types";

export interface IStockRepository {
  insertMany(prices: StockPrice[]): Promise<void>;
  getHistorical(symbol: string, from?: string, to?: string): Promise<StockPrice[]>;
}