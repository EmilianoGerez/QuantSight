import { SymbolResult } from "@/modules/watchlist/types";
import yahooFinance from "yahoo-finance2";

export class YahooFinanceRepository {
  async searchSymbols(query: string): Promise<Array<SymbolResult>> {
    console.log("Searching for symbols: ", query);
    const results = await yahooFinance.search(query);

    return results.quotes
      .filter((q) => "symbol" in q)
      .map((q: any) => ({
        symbol: q.symbol,
        shortname: q.shortname,
        longname: q.longname,
        exchange: q.exchange,
      }));
  }
}
