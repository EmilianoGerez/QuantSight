import { YahooFinanceRepository } from "@/external/repositories/yahoo.repository";
import { IWatchlistRepository } from "./interfaces";
import { WatchlistItem, SymbolResult } from "./types";


export class WatchlistService {
  constructor(private repo: IWatchlistRepository, private yahooRepo: YahooFinanceRepository) {}

  async getAll(): Promise<WatchlistItem[]> {
    return this.repo.getAll();
  }

  async add(symbol: string, name?: string, exchange?: string, provider?: string): Promise<void> {
    await this.repo.add(symbol, name, exchange, provider);
  }

  async remove(symbol: string): Promise<void> {
    await this.repo.remove(symbol);
  }

  async searchSymbols(query: string): Promise<SymbolResult[]> {
    return this.yahooRepo.searchSymbols(query);
  }

}