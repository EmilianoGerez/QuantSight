import { StockPrice } from "../stocks/types";
import { RSI, EMA, SMA, ATR, SD } from "technicalindicators";
import { TechnicalIndicators } from "./types";

export function evaluateSignals(prices: StockPrice[], indicators: TechnicalIndicators) {
  const lastPrice = prices.at(-1)?.close ?? 0;
  const lastRsi = indicators.rsi14?.at(-1) ?? 50;
  const lastEma200 = indicators.ema200?.at(-1) ?? 0;
  const lastSma = indicators.sma20?.at(-1) ?? 0;
  const lastStd = indicators.std20?.at(-1) ?? 1;

  const signals = [];

  // Toque EMA200
  const emaTouch = Math.abs(lastPrice - lastEma200) / lastEma200 < 0.01;

  if (emaTouch) {
    const trend = lastPrice > lastEma200 ? "alcista" : "bajista";
    signals.push({
      name: "Toque EMA200",
      active: true,
      details: `El precio está tocando la EMA200 en una tendencia ${trend}.`,
    });
  }

  // Sobreventa + 2 desviaciones estándar
  if (lastRsi < 30 && lastPrice < lastSma - 2 * lastStd) {
    signals.push({
      name: "Sobreventa + 2 STD",
      active: true,
      details:
        "RSI < 30 y el precio está más de 2 desviaciones estándar por debajo de la media.",
    });
  }

  // Sobreventa + banda inferior de Bollinger
  const lowerBollinger = lastSma - 2 * lastStd;
  if (lastRsi < 30 && lastPrice <= lowerBollinger) {
    signals.push({
      name: "Sobreventa + Bollinger",
      active: true,
      details:
        "RSI < 30 y el precio está tocando la banda inferior de Bollinger.",
    });
  }

  return signals;
}

export function calculateIndicators(prices: StockPrice[]) {
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
