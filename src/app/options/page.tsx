"use client";

import { OptionsChainTable } from "@/components/options/options-chain-table";
import { useState, useMemo } from "react";
import { OptionRow } from "@/domain/model/option-row.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";

export default function OptionsPage() {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"strike" | "iv">("strike");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // SWR for options data
  const {
    data: optionsData,
    error,
    isLoading,
  } = useSWR<OptionRow[]>(
    symbol ? `/api/options-chain?symbol=${symbol}` : null,
    fetcher,
    {
      refreshInterval: 15_000, // 15 s polling
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
    }
  );

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

  return (
    <main className="grid grid-cols-1 xl:grid-cols-6 gap-4 p-4">
      <section className="col-span-4 space-y-4">
        <div className="relative mt-1 w-32">
          <Input
            id="symbol-input"
            type="text"
            className="pr-8 rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="AAPL"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>

        {symbol && Object.keys(expirationGroups).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Expiration Dates:
            </h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(expirationGroups).map(
                ([monthYear, expirations]) => (
                  <div key={monthYear} className="flex flex-col gap-2">
                    <h5 className="text-xs font-medium text-gray-600">
                      {monthYear}
                    </h5>
                    <div className="flex gap-2">
                      {expirations.map((expiration) => {
                        const date = new Date(expiration + "T00:00:00"); // Add time to avoid timezone issues
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
          <div className="flex gap-4 items-center">
            <h4 className="text-sm font-medium text-gray-700">Sort by:</h4>
            <Button
              variant={sortBy === "strike" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("strike")}
            >
              Strike {sortBy === "strike" && (sortOrder === "asc" ? "↑" : "↓")}
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

        {symbol && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calls ({symbol})</CardTitle>
              </CardHeader>
              <CardContent>
                <OptionsChainTable
                  optionsData={callsData}
                  isLoading={isLoading}
                  error={error}
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
                />
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <aside className="col-span-2 space-y-4">
        <div className="text-muted-foreground text-sm">
          This section will show the selected options and their details.
        </div>
      </aside>
    </main>
  );
}
