import { OptionRow } from "./option-row.model";

export type StrategyLeg = OptionRow & {
  side: "buy" | "sell";
  quantity: number;
};