import { IStockRepository } from "./interfaces";
import { StockPrice } from "./types";
import yahooFinance from "yahoo-finance2";
import { RSI, EMA, SMA, ATR, SD } from "technicalindicators";
import { TechnicalIndicators } from "../signals/types";

export class StockService {
  constructor(private repo: IStockRepository) {}

  async addPrices(prices: StockPrice[]): Promise<void> {
    await this.repo.insertMany(prices);
  }

  /**
   * Fetch historical prices for a symbol between from and to dates.
   * If data is missing in DB, fetch from Yahoo, cache, and return all.
   * Returns prices + technical indicators.
   */
  async getHistorical(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<{prices: StockPrice[], indicators: TechnicalIndicators}> {
    // 1. Query DB for the period
    const dbData = await this.repo.getHistorical(symbol, from, to);

    // 2. Determine missing dates (simple version: if any day missing, fetch all)
    const expectedCount =
      from && to ? this.getDateDiff(from, to) + 1 : undefined;
    if (!(expectedCount && dbData.length >= expectedCount)) {
      // 3. Fetch from Yahoo if missing or empty
      const chartOptions: any = {};
      if (from) chartOptions.period1 = from;
      if (to) chartOptions.period2 = to;

      const yahooData = await yahooFinance
        .chart(symbol, chartOptions)
        .then((result: any) =>
          (result.quotes || []).map((d: any) => ({
            symbol,
            date: d.date,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume,
          }))
        )
        .catch(() => []);

      // 4. Insert new data into DB (if any)
      if (yahooData.length > 0) {
        await this.repo.insertMany(yahooData);
      }
      // 5. Merge and return all data (DB + Yahoo, deduped)
      dbData.push(...yahooData);
    }

    // Deduplicate and sort
    const prices = this.mergeData(dbData, []);

    // Calculate indicators in a separate function
    const indicators = this.calculateIndicators(prices);

    return {
      prices,
      indicators,
    };
  }

  // Helper: calculate indicators for the whole price series
  private calculateIndicators(prices: StockPrice[]) : TechnicalIndicators {
    const closes = prices.map((p) => Number(p.close));
    const highs = prices.map((p) => Number(p.high));
    const lows = prices.map((p) => Number(p.low));

    return {
      rsi14: RSI.calculate({ values: closes, period: 14 }),
      sma20: SMA.calculate({ values: closes, period: 20 }),
      ema50: EMA.calculate({ values: closes, period: 50 }),
      ema200: EMA.calculate({ values: closes, period: 200 }),
      atr14: ATR.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: 14,
      }),
      std20: SD.calculate({ values: closes, period: 20 }),
    };
  }

  // Helper: merge and dedupe by date
  private mergeData(
    dbData: StockPrice[],
    yahooData: StockPrice[]
  ): StockPrice[] {
    const map = new Map<string, StockPrice>();
    [...dbData, ...yahooData].forEach((item) => {
      map.set(new Date(item.date).toISOString().slice(0, 10), item);
    });
    // Sort by date ascending
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // Helper: get number of days between two dates (inclusive)
  private getDateDiff(from: string, to: string): number {
    const d1 = new Date(from);
    const d2 = new Date(to);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

   mergeIntradayData(dbData: StockPrice[], newData: StockPrice[]): StockPrice[] {
    const map = new Map<string, StockPrice>();
    [...dbData, ...newData].forEach((item) => {
      map.set(new Date(item.date).toISOString(), item);
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getIntradayHistorical(symbol: string): Promise<{ prices: StockPrice[]; indicators: TechnicalIndicators }> {
    const from = new Date();
    from.setUTCHours(13, 0, 0, 0); // 9AM NY (UTC-4 or UTC-5)
    const to = new Date();

    const dbData = await this.repo.getHistorical(symbol, from.toISOString(), to.toISOString());

    const chartOptions: any = {
      interval: "1h",
      period1: from.toISOString(),
      period2: to.toISOString(),
    };

    const yahooData = await yahooFinance
      .chart(symbol, chartOptions)
      .then((result: any) =>
        (result.quotes || []).map((d: any) => ({
          symbol,
          date: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume,
        }))
      )
      .catch(() => []);

    if (yahooData.length > 0) {
      await this.repo.insertMany(yahooData);
    }

    const prices = this.mergeIntradayData(dbData, yahooData);

    const closes = prices.map((p) => Number(p.close));
    const highs = prices.map((p) => Number(p.high));
    const lows = prices.map((p) => Number(p.low));

    const indicators: TechnicalIndicators = {
      rsi14: RSI.calculate({ values: closes, period: 14 }),
      sma20: SMA.calculate({ values: closes, period: 20 }),
      ema50: EMA.calculate({ values: closes, period: 50 }),
      ema200: EMA.calculate({ values: closes, period: 200 }),
      atr14: ATR.calculate({ high: highs, low: lows, close: closes, period: 14 }),
      std20: SD.calculate({ values: closes, period: 20 }),
    };

    return { prices, indicators };
  }
}
