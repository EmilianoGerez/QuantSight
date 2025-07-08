"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StrategyLeg } from "@/domain/model/option-strategy-leg";
import { expirations, netCost, netGreeks } from "@/lib/option-strategy-helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  legs: StrategyLeg[];
  onQuantityChange?: (index: number, newQty: number) => void;
  onRemoveLeg?: (index: number) => void;
};

export const StrategySummaryPanel: React.FC<Props> = ({
  legs,
  onQuantityChange,
  onRemoveLeg,
}) => {
  const cost = useMemo(() => netCost(legs), [legs]);
  const greeks = useMemo(() => netGreeks(legs), [legs]);
  const exps = useMemo(() => expirations(legs), [legs]);

  if (legs.length === 0)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Strategy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Select option legs to build a strategy
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Strategy&nbsp;Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Legs</span>
          <span>{legs.length}</span>
        </div>

        {/* Legs details as a table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border rounded bg-muted">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left font-semibold">Contract</th>
                <th className="px-2 py-1 text-left font-semibold">Type</th>
                <th className="px-2 py-1 text-left font-semibold">Side</th>
                <th className="px-2 py-1 text-left font-semibold">Strike</th>
                <th className="px-2 py-1 text-left font-semibold">
                  Expiration
                </th>
                <th className="px-2 py-1 text-center font-semibold">Qty</th>
                <th className="px-2 py-1 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {legs.map((leg, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="px-2 py-1" title={leg.contract}>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="relative group">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-gray-400 cursor-pointer"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{leg.contract}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-2 py-1">
                    {leg.type?.toUpperCase?.() ?? ""}
                  </td>
                  <td className="px-2 py-1">
                    {leg.side?.toUpperCase?.() ?? ""}
                  </td>
                  <td className="px-2 py-1">{leg.strike}</td>
                  <td className="px-2 py-1">{leg.expiration}</td>
                  <td className="px-2 py-1 text-center">
                    {onQuantityChange ? (
                      <input
                        type="number"
                        min={1}
                        value={leg.quantity}
                        onChange={(e) =>
                          onQuantityChange(idx, Number(e.target.value))
                        }
                        className="w-12 px-1 py-0.5 border rounded text-right mx-1"
                      />
                    ) : (
                      <span>{leg.quantity}</span>
                    )}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {onRemoveLeg && (
                      <button
                        type="button"
                        className="text-white hover:text-gray-500 transition-colors"
                        aria-label="Remove leg"
                        onClick={() => onRemoveLeg(idx)}
                      >
                        {/* Heroicons Trash Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 7.5V19a2 2 0 002 2h8a2 2 0 002-2V7.5M9.75 11.25v6M14.25 11.25v6M4.5 7.5h15m-10.125 0V5.25A1.5 1.5 0 0110.875 3.75h2.25a1.5 1.5 0 011.5 1.5V7.5"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <span>{cost >= 0 ? "Net Debit" : "Net Credit"}</span>
          <span className={cost >= 0 ? "text-red-600" : "text-green-600"}>
            {cost.toFixed(2)}$
          </span>
        </div>

        <hr />

        <div className="flex justify-between">
          <span>Δ</span>
          <span>{greeks.delta.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span>Γ</span>
          <span>{greeks.gamma.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span>Θ</span>
          <span>{greeks.theta.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span>Vega</span>
          <span>{greeks.vega.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span>Rho</span>
          <span>{greeks.rho.toFixed(3)}</span>
        </div>

        <hr />

        <div className="flex justify-between">
          <span>Expiration{exps.length > 1 ? "s" : ""}</span>
          <span>{exps.join(", ")}</span>
        </div>
      </CardContent>
    </Card>
  );
};
