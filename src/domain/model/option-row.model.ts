import { AlpacaOptionSnapshot } from "@/infrastructure/contract/alpaca-options-snapshots.contract";

export class OptionRow {
  contract: string;
  underlying: string;
  expiration: string;
  strike: number;
  type: "call" | "put";
  bid: number | null;
  ask: number | null;
  last: number | null;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
  iv?: number;
  missingGreeksOrIv: boolean;

  constructor(params: {
    contract: string;
    underlying: string;
    expiration: string;
    strike: number;
    type: "call" | "put";
    bid: number | null;
    ask: number | null;
    last: number | null;
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
    rho?: number;
    iv?: number;
    missingGreeksOrIv: boolean;
  }) {
    Object.assign(this, params);
  }

  static fromSnapshot(
    optionSymbol: string,
    snapshot: AlpacaOptionSnapshot
  ): OptionRow {
    // Parse OCC option symbol: [underlying][yymmdd][C/P][strike * 1000, padded]
    const underlying = optionSymbol.slice(0, optionSymbol.length - 15);
    const date = optionSymbol.slice(-15, -9); // YYMMDD
    const typeChar = optionSymbol.slice(-9, -8);
    const strikeStr = optionSymbol.slice(-8);

    const expiration = `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(
      4,
      6
    )}`;
    const type = typeChar === "C" ? "call" : "put";
    const strike = parseInt(strikeStr, 10) / 1000;

    const missingGreeksOrIv =
      !snapshot.greeks || snapshot.impliedVolatility === undefined;

    return new OptionRow({
      contract: optionSymbol,
      underlying,
      expiration,
      strike,
      type,
      bid: snapshot.latestQuote?.bp ?? null,
      ask: snapshot.latestQuote?.ap ?? null,
      last: snapshot.latestTrade?.p ?? null,
      delta: snapshot.greeks?.delta,
      gamma: snapshot.greeks?.gamma,
      theta: snapshot.greeks?.theta,
      vega: snapshot.greeks?.vega,
      rho: snapshot.greeks?.rho,
      iv: snapshot.impliedVolatility,
      missingGreeksOrIv,
    });
  }
}
