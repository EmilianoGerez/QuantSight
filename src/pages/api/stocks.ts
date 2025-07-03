import type { NextApiRequest, NextApiResponse } from "next";
import { StockRepository } from "@/modules/stocks/stock.repository";
import { StockService } from "@/modules/stocks/stock.service";
import { StockPrice } from "@/modules/stocks/types";

const repo = new StockRepository();
const service = new StockService(repo);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Insert many stock prices
    try {
      const prices: StockPrice[] = req.body;
      await service.addPrices(prices);
      res.status(201).json({ message: "Stock prices inserted" });
    } catch {
      res.status(500).json({ error: "Failed to insert stock prices" });
    }
  } else if (req.method === "GET") {
    // Get historical prices for a symbol
    const { symbol, from, to } = req.query;
    if (!symbol || typeof symbol !== "string") {
      return res.status(400).json({ error: "Symbol is required" });
    }
    const fromStr = Array.isArray(from) ? from[0] : from;
    const toStr = Array.isArray(to) ? to[0] : to;
    try {
      const data = await service.getHistorical(symbol, fromStr, toStr);
      res.status(200).json(data);
    } catch {
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
