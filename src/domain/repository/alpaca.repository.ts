import { AlpacaOptionsChainResponse } from "@/infrastructure/contract/alpaca-options-snapshots.contract";
import { AlpacaLatestStockQuote } from "@/infrastructure/contract/alpaca-stocks-latest-quote.contract";

export interface IAlpacaRepository {
  getOptionsChain(
    symbol: string,
    nextPageToken?: string
  ): Promise<AlpacaOptionsChainResponse>;
  getLatestStockQuote(symbol: string): Promise<AlpacaLatestStockQuote>;
}
