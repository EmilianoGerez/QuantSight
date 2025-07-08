import { StrategyLeg } from "@/domain/model/option-strategy-leg";


/** Mid-price helper (bid/ask may be null) */
export const midPrice = (leg: StrategyLeg): number => {
  if (leg.bid != null && leg.ask != null) return (leg.bid + leg.ask) / 2;
  if (leg.bid != null) return leg.bid;
  if (leg.ask != null) return leg.ask;
  return 0;
};

/** Net debit ( + ) / credit ( – ) in dollars (per 1x underlying lot of 100) */
export const netCost = (legs: StrategyLeg[]): number =>
  legs.reduce((sum, leg) => {
    const dollars = midPrice(leg) * 100 * leg.quantity;
    return sum + (leg.side === 'buy' ? dollars : -dollars);
  }, 0);

/** Aggregate Greeks (Δ, Γ, Θ, Vega, Rho) */
export interface NetGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}
export const netGreeks = (legs: StrategyLeg[]): NetGreeks =>
  legs.reduce<NetGreeks>(
    (sum, leg) => ({
      delta:
        sum.delta +
        (leg.delta ?? 0) * (leg.side === 'buy' ? 1 : -1) * leg.quantity,
      gamma:
        sum.gamma +
        (leg.gamma ?? 0) * (leg.side === 'buy' ? 1 : -1) * leg.quantity,
      theta:
        sum.theta +
        (leg.theta ?? 0) * (leg.side === 'buy' ? 1 : -1) * leg.quantity,
      vega:
        sum.vega +
        (leg.vega ?? 0) * (leg.side === 'buy' ? 1 : -1) * leg.quantity,
      rho:
        sum.rho +
        (leg.rho ?? 0) * (leg.side === 'buy' ? 1 : -1) * leg.quantity,
    }),
    { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 },
  );

/** Unique expirations in basket */
export const expirations = (legs: StrategyLeg[]): string[] =>
  Array.from(new Set(legs.map((l) => l.expiration)));


export function computePayoffAtPrice(
  price: number,
  legs: StrategyLeg[]
): number {
  return legs.reduce((total, leg) => {
    const isCall = leg.type === 'call';
    const intrinsic = isCall
      ? Math.max(price - leg.strike, 0)
      : Math.max(leg.strike - price, 0);

    const mid = ((leg.ask ?? 0) + (leg.bid ?? 0)) / 2 || 0;
    const entryCost = mid * 100;
    const pnlPerContract =
      (intrinsic * 100 - entryCost) * (leg.side === 'buy' ? 1 : -1);

    return total + pnlPerContract * leg.quantity;
  }, 0);
}
