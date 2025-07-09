import { OptionRow } from "@/domain/model/option-row.model";

export type LlmStrategyRequest = {
  aiModel: "openai" | "gemini";
  underlying: string;
  spotPrice: number;
  expiration: string;
  optionChain: OptionRow[];
  maxLegs?: number;
  bias?: string;
  targetPriceRange?: {
    min?: number;
    max?: number;
  };
};