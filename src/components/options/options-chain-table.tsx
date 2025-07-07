"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { OptionRow } from "@/domain/model/option-row.model";

type OptionsChainTableProps = {
  optionsData: OptionRow[];
  isLoading: boolean;
  error: string | null;
};

export const OptionsChainTable: React.FC<OptionsChainTableProps> = ({
  optionsData,
  isLoading,
  error,
}) => {
  /* ----------  UI states  ---------- */
  if (isLoading) return <SkeletonTable />;

  if (error)
    return (
      <div className="text-sm text-red-500 text-center py-8">
        Failed to load data: {error}
      </div>
    );

  if (!optionsData || optionsData.length === 0)
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No data
      </div>
    );

  /* ----------  Happy path  ---------- */
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Strike</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Expiration</TableHead>
          <TableHead>Bid</TableHead>
          <TableHead>Ask</TableHead>
          <TableHead>Last</TableHead>
          <TableHead>IV</TableHead>
          <TableHead>Δ</TableHead>
          <TableHead>Γ</TableHead>
          <TableHead>Θ</TableHead>
          <TableHead>Vega</TableHead>
          <TableHead>Rho</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {optionsData.map((row) => (
          <TableRow
            key={row.contract}
            className={row.missingGreeksOrIv ? "bg-gray-800" : ""}
          >
            <TableCell>{row.strike}</TableCell>
            <TableCell className="capitalize">{row.type}</TableCell>
            <TableCell>{row.expiration}</TableCell>
            <PriceCell value={row.bid} />
            <PriceCell value={row.ask} />
            <PriceCell value={row.last} />
            <NumericCell value={row.iv} suffix="%" />
            <NumericCell value={row.delta} />
            <NumericCell value={row.gamma} />
            <NumericCell value={row.theta} />
            <NumericCell value={row.vega} />
            <NumericCell value={row.rho} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

/* ----------  Helper sub-components  ---------- */

const SkeletonTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        {[
          "Strike",
          "Type",
          "Expiration",
          "Bid",
          "Ask",
          "Last",
          "IV",
          "Δ",
          "Γ",
          "Θ",
          "Vega",
          "Rho",
        ].map((h) => (
          <TableHead key={h}>{h}</TableHead>
        ))}
      </TableRow>
    </TableHeader>

    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 12 }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const PriceCell = ({ value }: { value: number | null | undefined }) => (
  <TableCell>{value ?? <span className="text-red-400">—</span>}</TableCell>
);

const NumericCell = ({
  value,
  suffix = "",
}: {
  value: number | undefined;
  suffix?: string;
}) => (
  <TableCell>
    {value !== undefined ? (
      value.toFixed(3) + suffix
    ) : (
      <span className="text-red-400">—</span>
    )}
  </TableCell>
);
