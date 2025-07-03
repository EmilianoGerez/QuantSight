export type Signal = {
  symbol: string;
  date: string;
  type: string;
  description: string;
}

export type TechnicalIndicators = {
  rsi14: number[];
  sma20: number[];
  ema50: number[];
  ema200: number[];
  atr14: number[];
  std20: number[];
};