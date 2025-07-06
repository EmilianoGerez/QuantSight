import { AlpacaOptionsChainResponse } from "@/infrastructure/contract/alpaca-options-snapshots.contract";

export interface IAlpacaRepository {
  getOptionsChain(symbol: string, nextPageToken?: string): Promise<AlpacaOptionsChainResponse>;
}