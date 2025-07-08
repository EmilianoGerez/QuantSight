"use client";

import { StrategyLeg } from "@/domain/model/option-strategy-leg";
import { computePayoffAtPrice } from "@/lib/option-strategy-helpers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ---------- Helpers ---------- */

type ChartPoint = { price: number; pnl: number; pos?: number; neg?: number };

/** Linear interpolation to estimate price where PnL crosses 0 */
function interpolateBE(p1: ChartPoint, p2: ChartPoint): number | null {
  if (p1.pnl === p2.pnl) return null;
  if ((p1.pnl > 0 && p2.pnl > 0) || (p1.pnl < 0 && p2.pnl < 0)) return null;

  const slope = (p2.pnl - p1.pnl) / (p2.price - p1.price);
  const zeroPrice = p1.price - p1.pnl / slope;
  return parseFloat(zeroPrice.toFixed(2));
}

/* ---------- Component ---------- */

type Props = { legs: StrategyLeg[]; underlyingPrice: number };

export const PayoffChart: React.FC<Props> = ({ legs, underlyingPrice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* price grid */
  const min = underlyingPrice * 0.7;
  const max = underlyingPrice * 1.3;
  const step = (max - min) / 100;

  const points: ChartPoint[] = Array.from({ length: 101 }, (_, i) => {
    const price = +(min + i * step).toFixed(2);
    const pnl = Math.round(computePayoffAtPrice(price, legs));

    return {
      price,
      pnl,
      pos: pnl >= 0 ? pnl : undefined,
      neg: pnl <= 0 ? pnl : undefined,
    };
  });

  /* find breakevens */
  const breakEvens: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const be = interpolateBE(points[i - 1], points[i]);
    if (be !== null) breakEvens.push(be);
  }

  // Chart component that can be reused
  const ChartComponent = ({
    isFullscreen = false,
  }: {
    isFullscreen?: boolean;
  }) => (
    <div className={isFullscreen ? "h-[75vh] w-full" : "h-96 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ left: 80, right: 40, top: 20, bottom: 40 }}
        >
          {/* Grid */}
          <CartesianGrid
            strokeDasharray="2 2"
            stroke="#e5e7eb"
            strokeOpacity={0.8}
            horizontal={true}
            vertical={true}
          />

          {/* Axes */}
          <XAxis
            dataKey="price"
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            domain={[min, max]}
            type="number"
            tick={{ fontSize: isFullscreen ? 14 : 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
            tickLine={{ stroke: "#9ca3af" }}
            label={{
              value: "Stock Price",
              position: "insideBottom",
              offset: -10,
              style: {
                textAnchor: "middle",
                fontSize: isFullscreen ? 14 : 12,
                fill: "#374151",
              },
            }}
          />
          <YAxis
            tickFormatter={(v) => {
              const num = Number(v);
              return num >= 1000
                ? `$${(num / 1000).toFixed(1)}k`
                : `$${num.toFixed(0)}`;
            }}
            width={85}
            domain={["dataMin - 100", "dataMax + 100"]}
            tick={{ fontSize: isFullscreen ? 14 : 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
            tickLine={{ stroke: "#9ca3af" }}
            label={{
              value: "Profit/Loss",
              angle: -90,
              position: "insideLeft",
              style: {
                textAnchor: "middle",
                fontSize: isFullscreen ? 14 : 12,
                fill: "#374151",
              },
            }}
          />

          {/* Tooltip */}
          <Tooltip
            formatter={(value: number) => [
              `$${value.toFixed(0)}`,
              value >= 0 ? "Profit" : "Loss",
            ]}
            labelFormatter={(label: number) =>
              `Stock Price: $${label.toFixed(2)}`
            }
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              color: "#111827",
              fontSize: isFullscreen ? "14px" : "13px",
              fontWeight: "500",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: isFullscreen ? "16px" : "12px",
            }}
            labelStyle={{
              color: "#374151",
              fontWeight: "600",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#111827",
              fontWeight: "500",
            }}
            cursor={{
              stroke: "#6366f1",
              strokeWidth: 2,
              strokeDasharray: "4 4",
              opacity: 0.7,
            }}
          />

          {/* Profitable area (green) */}
          <Area
            type="monotone"
            dataKey="pos"
            stroke="none"
            fill="rgba(16, 185, 129, 0.2)"
            isAnimationActive={false}
            connectNulls
          />

          {/* Losing area (red) */}
          <Area
            type="monotone"
            dataKey="neg"
            stroke="none"
            fill="rgba(252, 0, 0, 0.2)"
            isAnimationActive={false}
            connectNulls
          />

          {/* Payoff line */}
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="#1d4ed8"
            strokeWidth={isFullscreen ? 4 : 3}
            dot={false}
            isAnimationActive={false}
            strokeLinecap="round"
          />

          {/* Zero-P&L reference */}
          <ReferenceLine
            y={0}
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="6 4"
            label={{
              value: "Break Even",
              position: "insideTopRight",
              fill: "#6b7280",
              fontSize: isFullscreen ? 12 : 11,
            }}
          />

          {/* Spot price line */}
          <ReferenceLine
            x={underlyingPrice}
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="8 4"
            label={{
              value: `Current: $${underlyingPrice.toFixed(2)}`,
              position: "top",
              fill: "#dc2626",
              fontSize: isFullscreen ? 12 : 11,
              fontWeight: 600,
              offset: 5,
            }}
          />

          {/* Breakeven lines */}
          {breakEvens.map((be, index) => (
            <ReferenceLine
              key={`breakeven-${index}-${be}`}
              x={be}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="6 6"
              label={{
                value: `BE: $${be}`,
                position: index % 2 === 0 ? "top" : "bottom",
                fill: "#059669",
                fontSize: isFullscreen ? 12 : 11,
                fontWeight: 600,
                offset: 5,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Option Strategy Payoff
          </h3>
          <p className="text-sm text-gray-600">
            Profit/Loss at expiration • Current Spot: ${underlyingPrice}
          </p>
        </div>

        {/* Expand Button */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              title="Expand chart to fullscreen"
            >
              <Expand className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[70vw] min-w-[70vw] h-[96vh] p-4 bg-white">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-2xl font-semibold text-gray-800">
                Option Strategy Payoff - Fullscreen View
              </DialogTitle>
              <p className="text-base text-gray-600">
                Profit/Loss at expiration • Current Spot: ${underlyingPrice}
                {breakEvens.length > 0 &&
                  ` • Break-even${
                    breakEvens.length > 1 ? "s" : ""
                  }: ${breakEvens.map((be) => `$${be}`).join(", ")}`}
              </p>
            </DialogHeader>

            <ChartComponent isFullscreen={true} />

            {/* Legend for fullscreen */}
            <div className="mt-4 flex flex-wrap gap-8 text-base text-gray-700 border-t pt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-blue-600 rounded"></div>
                <span className="font-medium">Payoff Curve</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-red-600 opacity-70 rounded"></div>
                <span className="font-medium">Current Price</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-green-600 opacity-70 rounded"></div>
                <span className="font-medium">Break Even</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-4 bg-green-500 opacity-25 rounded"></div>
                <span className="font-medium">Profit Zone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-4 bg-red-500 opacity-25 rounded"></div>
                <span className="font-medium">Loss Zone</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ChartComponent />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-600"></div>
          <span>Payoff Curve</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-600 opacity-60"></div>
          <span>Current Price</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-600 opacity-60"></div>
          <span>Break Even</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-green-500 opacity-20"></div>
          <span>Profit Zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-red-500 opacity-20"></div>
          <span>Loss Zone</span>
        </div>
      </div>
    </div>
  );
};
