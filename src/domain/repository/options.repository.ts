import { OptionRow } from "@/domain/model/option-row.model";
import { Prisma } from "@prisma/client";

export interface IOptionsRepository {
  getOptionsChain(symbol: string): Promise<OptionRow[]>;
  getCachedSnapshot(
    symbol: string
  ): Promise<{ data: Prisma.JsonValue; snapshotAt: Date } | null>;
  createSnapshot(symbol: string, rows: OptionRow[]): Promise<void>;
}
