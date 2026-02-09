// src/components/trending/trending-list.tsx
"use client";

import { TrendingStock } from "@/types";
import { Card } from "@/components/ui/card";
import { SignalBadge } from "@/components/signals/signal-badge";
import { formatNumber, cn } from "@/lib/utils";
import { Flame, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

interface TrendingListProps {
  stocks: TrendingStock[];
  className?: string;
}

export function TrendingList({ stocks, className }: TrendingListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {stocks.map((stock, index) => (
        <Card key={stock.ticker} className="p-4 hover:border-primary/30 transition-colors">
          <Link href={`/dashboard/stock/${stock.ticker}`}>
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex flex-col items-center w-8">
                {index < 3 ? (
                  <Flame className={cn(
                    "w-5 h-5",
                    index === 0 && "text-hold",
                    index === 1 && "text-muted",
                    index === 2 && "text-orange-700"
                  )} />
                ) : (
                  <span className="text-lg font-bold text-muted">{stock.rank}</span>
                )}
              </div>

              {/* Stock Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-text">{stock.ticker}</span>
                  <SignalBadge signal={stock.signal} size="sm" />
                </div>
                <p className="text-xs text-muted truncate">{stock.reason}</p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className={cn(
                  "flex items-center justify-end gap-1 text-sm font-medium",
                  stock.sentimentChange >= 0 ? "text-buy" : "text-sell"
                )}>
                  {stock.sentimentChange >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {stock.sentimentChange > 0 ? "+" : ""}{stock.sentimentChange}%
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {formatNumber(stock.mentionCount)} mentions
                </p>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
