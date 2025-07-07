import { OptionRow } from "./option-row.model";

export interface OptionSnapshot {
    id: bigint;
    symbol: string;
    snapshotAt: Date;
    data: OptionRow[];
}