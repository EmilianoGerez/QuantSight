// Example contract for Alpaca options chain API response

export interface AlpacaOptionQuote {
  ap: number; // ask price
  as: number; // ask size
  ax: string; // ask exchange
  bp: number; // bid price
  bs: number; // bid size
  bx: string; // bid exchange
  c: string; // condition
  t: string; // quote time (ISO string)
}

export interface AlpacaOptionTrade {
  c: string; // condition
  p: number; // price
  s: number; // size
  t: string; // trade time (ISO string)
  x: string; // exchange
}

export interface AlpacaOptionGreeks {
  delta: number;
  gamma: number;
  rho: number;
  theta: number;
  vega: number;
}

export interface AlpacaOptionBar {
  c: number; // close
  h: number; // high
  l: number; // low
  n: number; // number of trades
  o: number; // open
  t: string; // time (ISO string)
  v: number; // volume
  vw: number; // volume weighted price
}

export interface AlpacaOptionSnapshot {
  latestQuote?: AlpacaOptionQuote;
  latestTrade?: AlpacaOptionTrade;
  greeks?: AlpacaOptionGreeks;
  impliedVolatility?: number;
  dailyBar?: AlpacaOptionBar;
  minuteBar?: AlpacaOptionBar;
  prevDailyBar?: AlpacaOptionBar;
}

export interface AlpacaOptionsChainResponse {
  next_page_token?: string;
  snapshots: {
    [optionSymbol: string]: AlpacaOptionSnapshot;
  };
}
