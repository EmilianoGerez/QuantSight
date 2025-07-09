
export type LlmStrategySuggestion = {
  name: string;
  rationale: string;
  outlook: string;
  riskProfile: string;
  legs: { action: string; contract: string; quantity: number, strike: number }[];
};
