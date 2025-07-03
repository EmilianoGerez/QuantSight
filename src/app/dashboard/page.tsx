"use client";

// src/app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalsTable } from "@/components/dashboard/signals-table";
import { useState } from "react";
import { AddSymbolModal } from "@/components/dashboard/add-symbol-modal";
import { WatchlistTable } from "@/components/dashboard/watchlist";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refetchWatchlist = () => setRefreshKey((k) => k + 1);

  return (
    <main className="grid grid-cols-1 xl:grid-cols-6 gap-4 p-4">
      <section className="col-span-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Señales Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <SignalsTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Técnico Diario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Aquí podrás ver el resumen de indicadores clave como RSI, ATR, y
              distancia a medias.
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Watchlist</CardTitle>
            <AddSymbolModal onAdded={refetchWatchlist} />
          </CardHeader>
          <CardContent>
            <WatchlistTable key={refreshKey} />
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
