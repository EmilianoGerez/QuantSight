import { StockPrice } from "../stocks/types";
import { ISignalRepository } from "./interfaces";
import { Signal, TechnicalIndicators } from "./types";

// Service implementation
export class SignalService {
  constructor(private repo: ISignalRepository) {}

  detectSignals(
    symbol: string,
    prices: StockPrice[],
    indicators: TechnicalIndicators
  ): Signal[] {
    const signals: Signal[] = [];

    for (let i = 199; i < prices.length; i++) {
      if (
        indicators.rsi14.length <= i - 14 ||
        indicators.std20.length <= i - 20 ||
        indicators.ema200.length <= i - 199 ||
        indicators.sma20.length <= i - 20
      )
        continue;

      const price = prices[i];
      const close = price.close;
      const prevClose = prices[i - 1]?.close;
      const rsi = indicators.rsi14[i - 14];
      const std = indicators.std20[i - 20];
      const ema200 = indicators.ema200[i - 199];
      const sma = indicators.sma20[i - 20];
      const date = new Date(price.date).toISOString();

      if (
        isNaN(std) ||
        std === 0 ||
        close === undefined ||
        prevClose === undefined
      )
        continue;

      // EMA200 Touch
      if (prevClose > ema200 && close <= ema200) {
        signals.push({
          symbol,
          date,
          type: "EMA200_touch_down",
          description:
            "Price touches the EMA200 from above (possible support).",
        });
      } else if (prevClose < ema200 && close >= ema200) {
        signals.push({
          symbol,
          date,
          type: "EMA200_touch_up",
          description:
            "Price touches the EMA200 from below (possible resistance).",
        });
      }

      // RSI + 2 STD
      if (rsi < 30 && sma - close > 2 * std) {
        signals.push({
          symbol,
          date,
          type: "RSI_Oversold_2STD",
          description:
            "RSI < 30 and price is more than 2 standard deviations below the average.",
        });
      }

      // RSI + Lower Band
      const lowerBand = sma - 2 * std;
      if (rsi < 30 && close <= lowerBand) {
        signals.push({
          symbol,
          date,
          type: "RSI_BB_Lower",
          description: "RSI < 30 and price touches the lower Bollinger band.",
        });
      }
    }

    return signals;
  }

  async saveIfNotExists(signal: Signal) {
    const mapped = {
      symbol: signal.symbol,
      name: signal.type,
      detail: signal.description,
      created_at: signal.date,
    };

    const exists = await this.repo.exists(
      mapped.symbol,
      mapped.name,
      mapped.created_at
    );
    if (!exists) {
      await this.repo.insert(mapped);
    }
  }

  async getRecentSignals(limit = 20, symbol?: string): Promise<Signal[]> {
    return this.repo.getRecent(limit, symbol);
  }
}
