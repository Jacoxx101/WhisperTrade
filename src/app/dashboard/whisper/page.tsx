// src/app/dashboard/whisper/page.tsx
"use client";

import { useState } from "react";
import { SignalCard } from "@/components/signals/signal-card";
import { mockSignals, mockWatchlist } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Link from "next/link";

export default function WhisperPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get signals for watchlist items
  const watchlistSignals = mockWatchlist
    .map((item) => mockSignals.find((s) => s.ticker === item.ticker))
    .filter(Boolean);

  const currentSignal = watchlistSignals[currentIndex];

  const nextSignal = () => {
    setCurrentIndex((prev) => (prev + 1) % watchlistSignals.length);
  };

  const prevSignal = () => {
    setCurrentIndex((prev) => (prev - 1 + watchlistSignals.length) % watchlistSignals.length);
  };

  if (!currentSignal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted text-center">No stocks in your watchlist</p>
        <Link href="/dashboard/watchlist" className="text-primary mt-4">
          Add stocks to watchlist
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </Link>
        <span className="text-sm font-medium text-muted">
          {currentIndex + 1} / {watchlistSignals.length}
        </span>
        <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors">
          <Maximize2 className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Previous Button */}
        <button
          onClick={prevSignal}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-muted" />
        </button>

        {/* Signal Card */}
        <div className="w-full max-w-sm">
          <SignalCard signal={currentSignal} variant="whisper" />
        </div>

        {/* Next Button */}
        <button
          onClick={nextSignal}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-muted" />
        </button>

        {/* Navigation Dots */}
        <div className="flex items-center gap-2 mt-8">
          {watchlistSignals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentIndex ? "w-6 bg-primary" : "bg-surface-hover hover:bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-muted">
          Swipe or use arrows to navigate
        </p>
      </div>
    </div>
  );
}
