import { prisma } from "../db/prisma-orm";
import { OptionRow } from "@/domain/model/option-row.model";
import { Prisma } from "@prisma/client";
import { IOptionsRepository } from "@/domain/repository/options.repository";

const TTL = (Number(process.env.CHAIN_SNAPSHOT_TTL_MIN) || 15) * 60_000;

export default class OptionsRepository implements IOptionsRepository {
  async getOptionsChain(symbol: string): Promise<OptionRow[]> {
    if (!symbol) throw new Error("Symbol is required");

    const cached = await this.getCachedSnapshot(symbol);
    if (cached) {
      return this.jsonToOptionRows(cached.data);
    }

    // Fallback: latest snapshot regardless of TTL
    const latest = await prisma.optionSnapshot.findFirst({
      where: { symbol },
      orderBy: { snapshotAt: "desc" },
    });

    return this.jsonToOptionRows(latest?.data ?? null);
  }

  async getCachedSnapshot(symbol: string) {
    return prisma.optionSnapshot.findFirst({
      where: { symbol, snapshotAt: { gte: new Date(Date.now() - TTL) } },
      orderBy: { snapshotAt: "desc" },
    });
  }

  async createSnapshot(symbol: string, rows: OptionRow[]): Promise<void> {
    await prisma.optionSnapshot.create({
      data: {
        symbol,
        data: JSON.parse(JSON.stringify(rows)),
        snapshotAt: new Date(),
      },
    });
  }

  private jsonToOptionRows(val: Prisma.JsonValue | null): OptionRow[] {
    if (!val) return [];

    // case 1: it's already parsed as an array
    if (Array.isArray(val)) {
      return val as unknown as OptionRow[];
    }

    // case 2: someone accidentally saved a stringified JSON
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed as OptionRow[];
      } catch (e) {
        console.error("Bad JSON in DB:", e);
      }
    }

    console.warn("OptionSnapshot.data is not an array");
    return [];
  }
}
