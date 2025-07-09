import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { LlmStrategyRequest } from "@/infrastructure/contract/llm-strategy-request.contract";
import { LlmStrategySuggestion } from "@/infrastructure/contract/llm-strategy-suggestion.contract";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const body = req.body as LlmStrategyRequest;
  const { underlying, spotPrice, expiration, optionChain, maxLegs } = body;

  const systemPrompt = `
You are a financial trading assistant specialized in options. Given the option chain data for a symbol, suggest a valid options strategy using at most ${maxLegs} legs.

Constraints:
- Use only data provided (expiration, strikes, greeks, IV, etc).
- Make sure the strategy is valid and reflects the market condition.
- Return legs using JSON and a clear explanation.

Only respond with JSON in this structure:
{
  "name": "...",
  "rationale": "...",
  "outlook": "...",
  "riskProfile": "...",
  "legs": [ { "action": "", "contract": "", "strike": 0, "quantity": 0 } ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            underlying,
            spotPrice,
            expiration,
            optionChain,
          }),
        },
      ],
    });

    const match = response.choices[0]?.message.content?.match(/\{[\s\S]+\}/);
    if (!match) return res.status(400).json({ error: "No JSON found" });

    try {
      const suggestion: LlmStrategySuggestion = JSON.parse(match[0]) as LlmStrategySuggestion;
      return res.status(200).json(suggestion);
    } catch {
      return res.status(500).json({ error: "Failed to parse LLM JSON" });
    }
  } catch (err) {
    return res.status(500).json({ error: "LLM request failed", details: err });
  }
}
