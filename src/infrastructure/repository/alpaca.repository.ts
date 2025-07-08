import Alpaca from "@alpacahq/alpaca-trade-api";
import { AlpacaOptionsChainResponse } from "@/infrastructure/contract/alpaca-options-snapshots.contract";
import { IAlpacaRepository } from "@/domain/repository/alpaca.repository";
import { AlpacaLatestStockQuote } from "../contract/alpace-stocks-lastest-quote.contract";

export default class AlpacaRepository implements IAlpacaRepository {
  private readonly alpaca: Alpaca;

  constructor() {
    this.alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_SECRET_KEY,
      paper: true, // Use paper trading environment
    });
  }

  async alpacaFetch(url: string) {
    const r = await fetch(url, {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_KEY_ID!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
        accept: "application/json",
      },
      cache: "no-store", // always hit the API (we’ll cache ourselves)
    });
    if (!r.ok) throw new Error(`Alpaca ${r.status}`);
    return r.json();
  }

  async getOptionsChain(
    symbol: string,
    nextPageToken?: string
  ): Promise<AlpacaOptionsChainResponse> {
    try {
      const params = {
        feed: "indicative",
        limit: "500",
        ...(nextPageToken && { page_token: nextPageToken }),
      };
      const queryString = new URLSearchParams(params).toString();
      const url = `https://data.alpaca.markets/v1beta1/options/snapshots/${encodeURIComponent(
        symbol
      )}?${queryString}`;
      const data = await this.alpacaFetch(url);
      return data as AlpacaOptionsChainResponse;
    } catch (error) {
      console.error("Error fetching options chain:", error);
      throw error;
    }
  }

  async getLatestStockQuote(symbol: string): Promise<AlpacaLatestStockQuote> {
    try {
      const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(
        symbol
      )}/quotes/latest?feed=delayed_sip`;
      const data = await this.alpacaFetch(url);
      return data as AlpacaLatestStockQuote;
    } catch (error) {
      console.error("Error fetching latest stock quote:", error);
      throw error;
    }
  }
}
