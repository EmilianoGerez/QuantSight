import type { NextApiRequest, NextApiResponse } from "next";
import { WatchlistRepository } from "@/modules/watchlist/watchlist.repository";
import { WatchlistService } from "@/modules/watchlist/watchlist.service";
import { YahooFinanceRepository } from "@/infrastructure/repository/yahoo.repository";

const repo = new WatchlistRepository();
const yahooRepo = new YahooFinanceRepository();
const service = new WatchlistService(repo, yahooRepo);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get all watchlist items
    try {
      const items = await service.getAll();
      res.status(200).json(items);
    } catch {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  } else if (req.method === "POST") {
    // Add a symbol to the watchlist
    const { symbol, name, exchange, provider } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }
    try {
      await service.add(symbol, name, exchange, provider);
      res.status(201).json({ message: "Added to watchlist" });
    } catch {
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  } else if (req.method === "DELETE") {
    // Remove a symbol from the watchlist
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }
    try {
      await service.remove(symbol);
      res.status(200).json({ message: "Removed from watchlist" });
    } catch {
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
