import db from "@/infrastructure/repository/db/db";
import { SignalService } from "@/modules/signals/signals.services";
import { StockService } from "@/modules/stocks/stock.service";
import { StockRepository } from "@/modules/stocks/stock.repository";
import { WatchlistRepository } from "@/modules/watchlist/watchlist.repository";
import { SignalRepository } from "@/modules/signals/signals.repository";

async function run() {
  console.log("[Signal Job] Starting scan...");

  const watchlistRepo = new WatchlistRepository();
  const stockRepo = new StockRepository();

  const stockService = new StockService(stockRepo);
  const signalRepo = new SignalRepository();
  const signalService = new SignalService(signalRepo);

  const symbols = await watchlistRepo.getAll();
  console.log(`[Signal Job] ${symbols.length} symbols in watchlist`);

  for (const { symbol } of symbols) {
    console.log(`\n[Signal Job] Checking: ${symbol}`);

    const { prices, indicators } = await stockService.getIntradayHistorical(
      symbol
    );
    const signals = signalService.detectSignals(symbol, prices, indicators);

    for (const signal of signals) {
      await signalService.saveIfNotExists(signal);
    }
  }

  console.log("[Signal Job] Done.");
  await db.end(); // optional if you want to cleanly exit pool
}

run().catch((err) => {
  console.error("[Signal Job] Error:", err);
  process.exit(1);
});
