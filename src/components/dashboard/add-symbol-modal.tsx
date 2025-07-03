// src/components/dashboard/add-symbol-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, PlusIcon } from "lucide-react";

interface SymbolResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
}

export function AddSymbolModal({ onAdded }: { onAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const search = async () => {
    if (!query) return;
    setLoading(true);
    const res = await fetch(`/api/search-symbols?q=${query}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const addToWatchlist = async (symbol: string, name: string, exchange: string) => {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, exchange })
    });
    onAdded();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Agregar símbolo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buscar símbolo</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ej: AAPL, MSFT, BTC-USD"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button onClick={search} size="icon" variant="outline">
            <SearchIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
          {loading && <div className="text-sm text-muted-foreground">Buscando...</div>}
          {!loading && results.length === 0 && query && <div className="text-sm text-muted-foreground">Sin resultados.</div>}
          {results.map((item) => (
            <div key={item.symbol} className="flex justify-between items-center border p-2 rounded">
              <div>
                <div className="font-semibold">{item.symbol}</div>
                <div className="text-xs text-muted-foreground">
                  {item.longname || item.shortname} • {item.exchange || ""}
                </div>
              </div>
              <Button size="sm" onClick={() => addToWatchlist(item.symbol, item.longname || item.symbol, item.exchange || "")}>Agregar</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
