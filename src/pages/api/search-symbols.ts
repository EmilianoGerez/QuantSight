// src/pages/api/search-symbols.ts
import { YahooFinanceRepository } from "@/external/repositories/yahoo.repository";
import { WatchlistRepository } from "@/modules/watchlist/watchlist.repository";
import { WatchlistService } from "@/modules/watchlist/watchlist.service";
import { NextApiRequest, NextApiResponse } from "next";

// You need to provide both an IWatchlistRepository and a YahooFinanceRepository
const yahooRepo = new YahooFinanceRepository();
const repo = new WatchlistRepository();
const service = new WatchlistService(repo, yahooRepo);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const results = await service.searchSymbols(query);
    res.json(results);
  } catch (err) {
    console.error("searchSymbols failed:", err);
    res.status(500).json({ error: "Failed to search symbols" });
  }
}
