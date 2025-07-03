// src/components/dashboard/watchlist-table.tsx
"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { WatchlistItem } from "@/modules/watchlist/types";
import { Skeleton } from "@/components/ui/skeleton";

export function WatchlistTable() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setItems(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const removeItem = async (symbol: string) => {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol })
    });
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  };

if (loading)
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </div>
  );
if (items.length === 0)
return <div className="text-sm text-muted-foreground">Your watchlist is empty</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.symbol}</TableCell>
            <TableCell className="text-muted-foreground">{item.name}</TableCell>
            <TableCell>{item.exchange}</TableCell>
            <TableCell>{item.provider}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.symbol)}>
                <TrashIcon className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
