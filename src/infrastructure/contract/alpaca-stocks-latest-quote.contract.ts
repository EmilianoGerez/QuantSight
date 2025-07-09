// Alpaca latest stock quote contract
export interface AlpacaLatestStockQuote {
  quote: {
    ap: number; // ask price
    as: number; // ask size
    ax: string; // ask exchange
    bp: number; // bid price
    bs: number; // bid size
    bx: string; // bid exchange
    c: string[]; // conditions
    t: string; // timestamp
    z: string; // tape
  };
  symbol: string;
}