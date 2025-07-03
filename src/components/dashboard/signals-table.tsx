// src/components/dashboard/signals-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Signal } from "@/modules/signals/types";
import { Skeleton } from "@/components/ui/skeleton";

export function SignalsTable() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      setLoading(true);
      try {
        const res = await fetch("/api/signals?limit=20");
        const data = await res.json();
        setSignals(data);
      } catch (error) {
        console.error("Error fetching signals:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Signal</TableHead>
            <TableHead className="hidden md:table-cell">Detail</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (signals.length === 0)
    return (
      <div className="text-sm text-muted-foreground">No recent signals.</div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Signal</TableHead>
          <TableHead className="hidden md:table-cell">Detail</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {signals.map((s) => (
          <TableRow key={`${s.symbol}-${s.date}-${s.type}`}>
            <TableCell>
              <Link
                href={`/dashboard/${s.symbol}`}
                className="font-semibold hover:underline"
              >
                {s.symbol}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{s.type}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
              {s.description}
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {new Date(s.date).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
