import type { NextApiRequest, NextApiResponse } from "next";
import AlpacaRepository from "@/infrastructure/repository/alpaca.repository";
import { AlpacaLatestStockQuote } from "@/infrastructure/contract/alpace-stocks-lastest-quote.contract";

const alpacaRepo = new AlpacaRepository();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AlpacaLatestStockQuote | { error: string }>
) {
  const { symbol } = req.query;
  if (!symbol || typeof symbol !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid symbol parameter" });
  }
  try {
    const quote = await alpacaRepo.getLatestStockQuote(symbol);
    res.status(200).json(quote);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch latest quote";
    res.status(500).json({ error: errorMessage });
  }
}
