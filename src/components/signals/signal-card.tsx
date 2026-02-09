// src/components/signals/signal-card.tsx
"use client";

import { StockSignal } from "@/types";
import { Card } from "@/components/ui/card";
import { SignalBadge } from "./signal-badge";
import { ConfidenceBar } from "./confidence-bar";
import { formatPrice, formatPercent, formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Youtube, Twitter, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SignalCardProps {
  signal: StockSignal;
  variant?: "default" | "compact" | "whisper";
  className?: string;
}

export function SignalCard({ signal, variant = "default", className }: SignalCardProps) {
  if (variant === "whisper") {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-screen p-8", className)}>
        <div
          className={cn(
            "w-64 h-64 rounded-3xl flex flex-col items-center justify-center border-4 animate-fade-in",
            signal.signal === "buy" && "border-buy bg-buy/5 signal-glow-buy",
            signal.signal === "sell" && "border-sell bg-sell/5 signal-glow-sell",
            signal.signal === "hold" && "border-hold bg-hold/5 signal-glow-hold"
          )}
        >
          <SignalBadge signal={signal.signal} size="xl" />
          <span className="text-4xl font-bold text-text mt-4">{signal.ticker}</span>
          <span className="text-lg text-muted mt-1">{signal.confidence}% confidence</span>
        </div>
        <p className="text-center text-muted mt-8 max-w-xs">{signal.summary}</p>
        <div className="flex gap-4 mt-8">
          <span className="text-2xl font-mono font-semibold text-text">{formatPrice(signal.price)}</span>
          <span className={cn("text-lg font-mono", signal.change >= 0 ? "text-buy" : "text-sell")}>
            {formatPercent(signal.changePercent)}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("p-4 hover:border-primary/30 transition-colors cursor-pointer group", className)}>
        <Link href={`/dashboard/stock/${signal.ticker}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center">
                <span className="font-mono font-bold text-text">{signal.ticker.slice(0, 2)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-text">{signal.ticker}</h3>
                <p className="text-xs text-muted truncate max-w-[120px]">{signal.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SignalBadge signal={signal.signal} size="sm" />
              <div className="text-right">
                <p className="font-mono font-medium text-text">{formatPrice(signal.price)}</p>
                <p className={cn("text-xs font-mono", signal.change >= 0 ? "text-buy" : "text-sell")}>
                  {formatPercent(signal.changePercent)}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:border-primary/30 group",
        signal.signal === "buy" && "border-l-4 border-l-buy",
        signal.signal === "sell" && "border-l-4 border-l-sell",
        signal.signal === "hold" && "border-l-4 border-l-hold",
        className
      )}
    >
      <Link href={`/dashboard/stock/${signal.ticker}`}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center">
                <span className="font-mono font-bold text-lg text-text">{signal.ticker.slice(0, 2)}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-text">{signal.ticker}</h3>
                <p className="text-sm text-muted">{signal.name}</p>
              </div>
            </div>
            <SignalBadge signal={signal.signal} size="md" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-mono font-bold text-text">{formatPrice(signal.price)}</span>
            <span className={cn("font-mono font-medium", signal.change >= 0 ? "text-buy" : "text-sell")}>
              {formatPercent(signal.changePercent)}
            </span>
          </div>

          {/* Confidence */}
          <ConfidenceBar value={signal.confidence} className="mb-4" />

          {/* Summary */}
          <p className="text-sm text-muted line-clamp-2 mb-4">{signal.summary}</p>

          {/* Sources */}
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Youtube size={14} />
                {signal.sources.youtube}
              </span>
              <span className="flex items-center gap-1">
                <Twitter size={14} />
                {signal.sources.twitter}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                {signal.sources.reddit}
              </span>
            </div>
            <span>{formatTimeAgo(signal.lastUpdated)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-hover/50 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted">Based on {Object.values(signal.sources).reduce((a, b) => a + b, 0)} sources</span>
          <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </Card>
  );
}
