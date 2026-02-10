'use client';

import { useState, useEffect, useCallback } from 'react';
import { SignalCard } from '@/components/signals/signal-card';
import { TrendingList } from '@/components/trending/trending-list';
import { AlertItem } from '@/components/alerts/alert-item';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mockTrending, mockAlerts, mockWatchlist } from '@/lib/mock-data';
import { getBatchSignals, createPoller } from '@/lib/api-client';
import { StockSignal } from '@/types';
import {
  TrendingUp,
  Bell,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const REFRESH_INTERVAL = 120000; // 2 minutes
const DEFAULT_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'AMD', 'GME', 'AMC'];

export default function DashboardPage() {
  const [signals, setSignals] = useState<StockSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch signals
  const fetchSignals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const result = await getBatchSignals(DEFAULT_TICKERS);
      
      if (result.success && result.data) {
        setSignals(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch signals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchSignals();
    
    // Set up polling
    const poller = createPoller(
      () => getBatchSignals(DEFAULT_TICKERS),
      REFRESH_INTERVAL,
      (newSignals) => {
        setSignals(newSignals);
        setLastUpdated(new Date());
      },
      (err) => console.error('Polling error:', err)
    );
    
    poller.start();
    
    return () => poller.stop();
  }, [fetchSignals]);

  // Watchlist signals
  const watchlistSignals = mockWatchlist
    .slice(0, 3)
    .map((item) => signals.find((s) => s.ticker === item.ticker))
    .filter(Boolean) as StockSignal[];

  const recentAlerts = mockAlerts.slice(0, 3);
  const trendingStocks = mockTrending.slice(0, 5);

  // Loading skeletons
  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="col-span-6 space-y-4">
            <Skeleton className="h-8 w-32" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
          <div className="col-span-3 space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              Good morning, <span className="text-gradient">Trader</span> 👋
            </h1>
            <p className="text-muted mt-1">
              Here&apos;s what&apos;s happening in the markets today
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted hidden sm:inline">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchSignals(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-500">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Market Sentiment */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-text">Market Sentiment</span>
            </div>
            <span className="text-sm text-buy font-medium">Cautiously Bullish</span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-2">
            <div className="bg-buy h-2 rounded-full" style={{ width: '62%' }} />
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>Bearish</span>
            <span>62% Bullish</span>
            <span>Bullish</span>
          </div>
        </Card>

        {/* Watchlist */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Your Watchlist</h2>
            <Link href="/dashboard/watchlist">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {watchlistSignals.length > 0 ? (
              watchlistSignals.map((signal) => (
                <SignalCard key={signal.ticker} signal={signal} variant="compact" />
              ))
            ) : (
              <Card className="p-4">
                <p className="text-muted text-sm">No watchlist data available</p>
              </Card>
            )}
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-hold" />
              <h2 className="text-lg font-semibold text-text">Trending Now</h2>
            </div>
            <Link href="/dashboard/trending">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <TrendingList stocks={trendingStocks} />
        </section>

        {/* Recent Alerts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Recent Alerts</h2>
            </div>
            <Link href="/dashboard/alerts">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <Disclaimer />
      </div>

      {/* Desktop Layout - 3 Column */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Watchlist */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text">Watchlist</h2>
            <Link href="/dashboard/watchlist">
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {watchlistSignals.length > 0 ? (
              watchlistSignals.map((signal) => (
                <SignalCard key={signal.ticker} signal={signal} variant="compact" />
              ))
            ) : (
              <Card className="p-4">
                <p className="text-muted text-sm">No watchlist data available</p>
              </Card>
            )}
          </div>

          {/* Market Sentiment */}
          <Card className="p-4 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-text">Market Sentiment</span>
            </div>
            <div className="w-full bg-surface-hover rounded-full h-2">
              <div className="bg-buy h-2 rounded-full" style={{ width: '62%' }} />
            </div>
            <p className="text-xs text-buy font-medium mt-2">62% Bullish</p>
          </Card>
        </div>

        {/* Main Content - Signal Cards */}
        <div className="col-span-6 space-y-4">
          <h2 className="font-semibold text-text">Top Signals</h2>
          <div className="space-y-4">
            {signals.length > 0 ? (
              signals.slice(0, 4).map((signal) => (
                <SignalCard key={signal.ticker} signal={signal} />
              ))
            ) : (
              <Card className="p-6">
                <p className="text-muted">No signals available. Try refreshing the page.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar - Trending & Alerts */}
        <div className="col-span-3 space-y-6">
          {/* Trending */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text">Trending</h2>
              <Link href="/dashboard/trending">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <TrendingList stocks={trendingStocks.slice(0, 4)} />
          </div>

          {/* Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text">Alerts</h2>
              <Link href="/dashboard/alerts">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}

function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-3 bg-sell/5 border border-sell/20 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-sell flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          <strong className="text-text">Not Financial Advice.</strong> For informational purposes only.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-4 bg-sell/5 border border-sell/20 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-sell flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-muted">
          <strong className="text-text">Not Financial Advice:</strong> This platform provides AI-generated
          sentiment analysis for informational purposes only. Always do your own research and consult
          a financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
}
