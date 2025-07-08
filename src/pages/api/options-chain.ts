import getFullSnapshot from "@/application/use-case/getFullSnapshot";
import AlpacaRepository from "@/infrastructure/repository/alpaca.repository";
import OptionsRepository from "@/infrastructure/repository/options.repository";
import { NextApiRequest, NextApiResponse } from "next";

const alpacaRepo = new AlpacaRepository();
const optionsRepo = new OptionsRepository();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { symbol } = req.query;

  if (typeof symbol !== "string" || !symbol) {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'symbol' parameter" });
  }

  const cached = await optionsRepo.getCachedSnapshot(symbol);
  if (cached) {
    const latestQuote = await alpacaRepo.getLatestStockQuote(symbol);
    return res.json({ latestQuote: latestQuote, rows: cached.data });
  }

  const rows = await getFullSnapshot(symbol, alpacaRepo);
  await optionsRepo.createSnapshot(symbol, rows);
  const latestQuote = await alpacaRepo.getLatestStockQuote(symbol);
  return res.json({ latestQuote: latestQuote, rows });
}
