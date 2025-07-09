import { prisma } from "@/infrastructure/db/prisma-orm";
import { WatchlistItem } from "./types";

export class WatchlistRepository {
  async getAll(): Promise<WatchlistItem[]> {
    const result: WatchlistItem[] = await prisma.watchlist.findMany({
      orderBy: { addedAt: "desc" },
    });
    return result;
  }

  async add(
    symbol: string,
    name?: string,
    exchange?: string,
    provider = "yahoo"
  ): Promise<void> {
    try {
      await prisma.watchlist.create({
        data: {
          symbol: symbol.toUpperCase(),
          name: name || undefined,
          exchange: exchange || undefined,
          provider,
        },
      });
    } catch (error) {
      // Ignore duplicate key error (unique constraint)
      if (
        (error as any).code !== "P2002" ||
        ((error as any).meta &&
          (error as any).meta.target &&
          !(error as any).meta.target.includes("symbol"))
      ) {
        throw error;
      }
    }
  }

  async remove(symbol: string): Promise<void> {
    await prisma.watchlist.deleteMany({
      where: { symbol: symbol.toUpperCase() },
    });
  }
}
