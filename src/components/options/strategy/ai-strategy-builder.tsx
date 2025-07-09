import React, { useState, useMemo } from "react";
import { OptionRow } from "@/domain/model/option-row.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LlmStrategyRequest } from "@/infrastructure/contract/llm-strategy-request.contract";
import { Loader2 as Loader2Icon } from "lucide-react";

interface AiStrategyBuilderProps {
  options: OptionRow[];
  stockPrice: number;
  underlying: string;
  onSubmit?: (
    data: LlmStrategyRequest,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  layout?: "horizontal" | "vertical";
}

const AI_MODELS = [
  { label: "OpenAI", value: "openai" },
  { label: "Google Gemini 2.5", value: "gemini" },
];

const BIAS_OPTIONS = [
  { label: "Undefined", value: undefined },
  { label: "Bullish", value: "bullish" },
  { label: "Bearish", value: "bearish" },
  { label: "Neutral", value: "neutral" },
];

export const AiStrategyBuilder: React.FC<AiStrategyBuilderProps> = ({
  options,
  stockPrice,
  underlying,
  onSubmit,
  layout = "horizontal",
}) => {
  const [aiModel, setAiModel] = useState<"openai" | "gemini">(
    AI_MODELS[0].value as "openai" | "gemini"
  );
  const [expiration, setExpiration] = useState<string>("");
  const [bias, setBias] = useState<string | undefined>(undefined);
  const [targetMin, setTargetMin] = useState<string>("");
  const [targetMax, setTargetMax] = useState<string>("");
  const [loading, setLoading] = useState(false); // keep for compatibility, but will be controlled by parent

  // Get unique expiration dates
  const expirationDates = useMemo(() => {
    const unique = Array.from(new Set(options.map((o) => o.expiration))).sort();
    return unique;
  }, [options]);

  // Expose loading setter to parent via ref or callback
  React.useEffect(() => {
    if (
      typeof onSubmit === "object" &&
      onSubmit !== null &&
      "setLoading" in onSubmit
    ) {
      // Not standard usage, but for future extensibility
      (onSubmit as any).setLoading = setLoading;
    }
  }, [onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const filteredOptions = options.filter((o) => o.expiration === expiration);
    const payload: LlmStrategyRequest = {
      aiModel,
      underlying,
      spotPrice: stockPrice,
      expiration,
      optionChain: filteredOptions,
      bias,
      targetPriceRange: {
        min: targetMin ? parseFloat(targetMin) : undefined,
        max: targetMax ? parseFloat(targetMax) : undefined,
      },
    };
    try {
      if (onSubmit) await onSubmit(payload, setLoading);
      setLoading(false); // Ensure loading is set to false after API response
    } catch {
      setLoading(false);
    }
  };

  return (
    <form
      className={
        layout === "vertical"
          ? "flex flex-col gap-4"
          : "flex flex-row flex-wrap gap-4 items-end"
      }
      onSubmit={handleSubmit}
    >
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-medium mb-1">AI Model</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value as "openai" | "gemini")}
        >
          {AI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-medium mb-1">Expiration</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
        >
          <option value="">Select expiration</option>
          {expirationDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-medium mb-1">Bias</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={bias ?? ""}
          onChange={(e) => setBias(e.target.value || undefined)}
        >
          {BIAS_OPTIONS.map((b) => (
            <option key={b.label} value={b.value ?? ""}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[220px]">
        <label className="block text-sm font-medium mb-1">
          Target Price Range
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Min"
            value={targetMin}
            onChange={(e) => setTargetMin(e.target.value)}
          />
          <span className="self-center">-</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Max"
            value={targetMax}
            onChange={(e) => setTargetMax(e.target.value)}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="min-w-[140px]"
        size="sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2Icon className="animate-spin w-4 h-4" />
            Please wait
          </span>
        ) : (
          "Send to LLM"
        )}
      </Button>
    </form>
  );
};
