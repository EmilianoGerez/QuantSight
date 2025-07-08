"use client";

import { OptionsChainTable } from "@/components/options/options-chain-table";
import { useState, useMemo } from "react";
import { OptionRow } from "@/domain/model/option-row.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { StrategyLeg } from "@/domain/model/option-strategy-leg";
import { StrategySummaryPanel } from "@/components/options/strategy/strategy-summary-panel";
import { PayoffChart } from "@/components/options/strategy/payoff-chart";
import { AlpacaLatestStockQuote } from "@/infrastructure/contract/alpace-stocks-lastest-quote.contract";

export default function OptionsPage() {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"strike" | "iv">("strike");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [basket, setBasket] = useState<StrategyLeg[]>([]);

  // SWR for options data
  const {
    data: optionsApiData,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<{ latestQuote: AlpacaLatestStockQuote; rows: OptionRow[] }>(
    symbol ? `/api/options-chain?symbol=${symbol}` : null,
    fetcher,
    {
      refreshInterval: 15_000, // 15 s polling
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
    }
  );

  const optionsData = optionsApiData?.rows;
  const latestQuote = optionsApiData?.latestQuote;

  // Filter out expired contracts and apply expiration filter
  const filteredOptionsData = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

    let filtered = optionsData?.filter((option) => {
      const expirationDate = new Date(option.expiration + "T00:00:00"); // Add time to avoid timezone issues
      return expirationDate >= currentDate; // Only non-expired contracts
    });

    if (selectedExpiration) {
      filtered = filtered?.filter(
        (option) => option.expiration === selectedExpiration
      );
    }

    return filtered;
  }, [optionsData, selectedExpiration]);

  // Get unique expiration dates grouped by month/year
  const expirationGroups = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const validExpirations = optionsData
      ?.filter((option) => {
        const expirationDate = new Date(option.expiration + "T00:00:00"); // Add time to avoid timezone issues
        return expirationDate >= currentDate;
      })
      .map((option) => option.expiration)
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort();

    // Group by month/year
    const groups: { [key: string]: string[] } = {};
    validExpirations?.forEach((expiration) => {
      const date = new Date(expiration + "T00:00:00"); // Add time to avoid timezone issues
      const monthYear = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(expiration);
    });

    return groups;
  }, [optionsData]);

  // Separate calls and puts from filtered data and apply sorting
  const sortData = (data: OptionRow[]) => {
    return [...data].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (sortBy === "strike") {
        aValue = a.strike;
        bValue = b.strike;
      } else {
        aValue = a.iv || 0;
        bValue = b.iv || 0;
      }

      if (sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const callsData = sortData(
    filteredOptionsData?.filter((option) => option.type === "call") || []
  );
  const putsData = sortData(
    filteredOptionsData?.filter((option) => option.type === "put") || []
  );

  const handleSort = (field: "strike" | "iv") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedSymbol = inputSymbol.trim().toUpperCase();
      if (trimmedSymbol) {
        setSymbol(trimmedSymbol);
      }
    }
  };

  const handleAddLeg = (newLeg: StrategyLeg) => {
    setBasket((prev) => {
      const idx = prev.findIndex(
        (leg) => leg.contract === newLeg.contract && leg.side === newLeg.side
      );
      if (idx !== -1) {
        // Increment quantity
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      } else {
        return [...prev, newLeg];
      }
    });
  };

  return (
    <main className="flex flex-col gap-4 p-4 w-full">
      {/* Header: input and filters full width */}
      <div className="w-full flex flex-col md:flex-row md:items-end gap-4 mb-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="relative w-1/4">
            <Input
              id="symbol-input"
              type="text"
              className="w-full pr-8 rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="AAPL"
            />
            <MagnifyingGlassIcon className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <button
              type="button"
              aria-label="Refresh"
              onClick={() => mutate()}
              disabled={isValidating}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
          {symbol && Object.keys(expirationGroups).length > 0 && (
            <div className="space-y-3 w-full py-4">
              <div className="flex flex-wrap gap-4">
                {Object.entries(expirationGroups).map(
                  ([monthYear, expirations]) => (
                    <div key={monthYear} className="flex flex-col gap-2">
                      <h5 className="text-xs font-medium text-gray-600">
                        {monthYear}
                      </h5>
                      <div className="flex gap-2">
                        {expirations.map((expiration) => {
                          const date = new Date(expiration + "T00:00:00");
                          const day = date.getDate();
                          return (
                            <Button
                              key={expiration}
                              variant={
                                selectedExpiration === expiration
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedExpiration(expiration)}
                            >
                              {day}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          {symbol && (
            <div className="flex gap-4 items-center w-full">
              <h4 className="text-sm font-medium text-gray-700">Sort by:</h4>
              <Button
                variant={sortBy === "strike" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("strike")}
              >
                Strike{" "}
                {sortBy === "strike" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant={sortBy === "iv" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("iv")}
              >
                IV {sortBy === "iv" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content: tables and summary side by side */}
      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="flex-1 space-y-6">
          {symbol && latestQuote && (
            <div className="mb-2 text-lg font-semibold text-white">
              {symbol} Price: ${latestQuote?.quote?.ap ?? "-"}
            </div>
          )}
          {symbol && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Calls ({symbol})</CardTitle>
                </CardHeader>
                <CardContent>
                  <OptionsChainTable
                    optionsData={callsData}
                    isLoading={isLoading}
                    error={error}
                    onAddLeg={handleAddLeg}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Puts ({symbol})</CardTitle>
                </CardHeader>
                <CardContent>
                  <OptionsChainTable
                    optionsData={putsData}
                    isLoading={isLoading}
                    error={error}
                    onAddLeg={handleAddLeg}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <aside className="xl:w-1/3 w-full space-y-4">
          <StrategySummaryPanel
            legs={basket}
            onQuantityChange={(index, newQty) => {
              setBasket((prev) => {
                if (newQty < 1) return prev;
                const updated = [...prev];
                updated[index] = { ...updated[index], quantity: newQty };
                return updated;
              });
            }}
            onRemoveLeg={(index) => {
              setBasket((prev) => prev.filter((_, i) => i !== index));
            }}
          />
          <PayoffChart
            legs={basket}
            underlyingPrice={latestQuote?.quote?.ap ?? 0}
          />
        </aside>
      </div>
    </main>
  );
}
