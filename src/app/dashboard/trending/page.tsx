// src/app/dashboard/trending/page.tsx
"use client";

import { useState } from "react";
import { TrendingList } from "@/components/trending/trending-list";
import { Card } from "@/components/ui/card";
import { mockTrending } from "@/lib/mock-data";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "tech" | "meme" | "crypto";
type TimeRange = "1h" | "24h" | "7d";

export default function TrendingPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  const filters: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "tech", label: "Tech" },
    { id: "meme", label: "Meme" },
    { id: "crypto", label: "Crypto" },
  ];

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: "1h", label: "1H" },
    { id: "24h", label: "24H" },
    { id: "7d", label: "7D" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Trending Now</h1>
          <p className="text-muted">Top stocks by social sentiment and mention volume</p>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-hold" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface rounded-lg">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-white"
                  : "text-muted hover:text-text"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                timeRange === range.id
                  ? "bg-surface-hover text-text"
                  : "text-muted hover:text-text"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-2xl font-bold text-text">47</p>
          <p className="text-xs text-muted">Buy Signals</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-sell">23</p>
          <p className="text-xs text-muted">Sell Signals</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-hold">31</p>
          <p className="text-xs text-muted">Hold Signals</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-buy">+12%</p>
          <p className="text-xs text-muted">Avg Sentiment Change</p>
        </Card>
      </div>

      {/* Sentiment Heatmap */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">Sentiment Heatmap</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-buy" /> Bullish
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-hold" /> Neutral
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-sell" /> Bearish
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {mockTrending.slice(0, 10).map((stock) => (
            <div
              key={stock.ticker}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center p-2",
                stock.signal === "buy" && "bg-buy/20 border border-buy/30",
                stock.signal === "sell" && "bg-sell/20 border border-sell/30",
                stock.signal === "hold" && "bg-hold/20 border border-hold/30"
              )}
            >
              <span className="font-bold text-text text-sm">{stock.ticker}</span>
              <span className={cn(
                "text-xs",
                stock.sentimentChange >= 0 ? "text-buy" : "text-sell"
              )}>
                {stock.sentimentChange > 0 ? "+" : ""}{stock.sentimentChange}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending List */}
      <div>
        <h2 className="font-semibold text-text mb-4">Top Movers</h2>
        <TrendingList stocks={mockTrending} />
      </div>
    </div>
  );
}
