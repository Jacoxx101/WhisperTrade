'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { SignalBadge } from '@/components/signals/signal-badge';
import { ConfidenceBar } from '@/components/signals/confidence-bar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mockSources, mockSignalHistory } from '@/lib/mock-data';
import { getSignal, createPoller } from '@/lib/api-client';
import { StockSignal } from '@/types';
import {
  formatPrice,
  formatPercent,
  formatTimeAgo,
  cn,
  calculateWinRate,
} from '@/lib/utils';
import {
  ArrowLeft,
  Bell,
  Share2,
  Star,
  Youtube,
  Twitter,
  MessageSquare,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const REFRESH_INTERVAL = 120000; // 2 minutes

// Stock name mapping
const stockNames: Record<string, string> = {
  AAPL: 'Apple Inc.',
  TSLA: 'Tesla, Inc.',
  NVDA: 'NVIDIA Corporation',
  AMD: 'Advanced Micro Devices',
  GME: 'GameStop Corp.',
  AMC: 'AMC Entertainment',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  MSFT: 'Microsoft Corporation',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms Inc.',
  NFLX: 'Netflix Inc.',
  COIN: 'Coinbase Global',
  PLTR: 'Palantir Technologies',
  RIVN: 'Rivian Automotive',
  SPY: 'SPDR S&P 500 ETF',
  QQQ: 'Invesco QQQ ETF',
};

export default function StockDetailPage() {
  const params = useParams();
  const ticker = (params.ticker as string)?.toUpperCase() || '';

  const [signal, setSignal] = useState<StockSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'history'>('overview');
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const sources = mockSources;
  const history = mockSignalHistory.filter((h) => h.ticker === ticker);
  const winRate = calculateWinRate(history);

  const fetchSignal = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const result = await getSignal(ticker);

      if (result.success && result.data) {
        setSignal(result.data);
        setError(null);
      } else {
        // Create a fallback signal from stock name
        const fallbackSignal: StockSignal = {
          id: `signal-${ticker}`,
          ticker,
          name: stockNames[ticker] || ticker,
          signal: 'hold',
          confidence: 0,
          price: 0,
          change: 0,
          changePercent: 0,
          summary: 'Data temporarily unavailable. Please try again later.',
          lastUpdated: new Date(),
          sources: { youtube: 0, twitter: 0, reddit: 0 },
          factors: [{ type: 'neutral', label: 'Status', value: 'Loading...' }],
        };
        setSignal(fallbackSignal);
        setError(result.error || 'Failed to fetch signal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ticker]);

  useEffect(() => {
    if (!ticker) return;

    fetchSignal();

    // Set up polling
    const poller = createPoller(
      () => getSignal(ticker),
      REFRESH_INTERVAL,
      (newSignal) => {
        setSignal(newSignal);
      },
      (err) => console.error('Polling error:', err)
    );

    poller.start();

    return () => poller.stop();
  }, [ticker, fetchSignal]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <Skeleton className="h-6 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const displaySignal = signal || {
    id: `signal-${ticker}`,
    ticker,
    name: stockNames[ticker] || ticker,
    signal: 'hold' as const,
    confidence: 0,
    price: 0,
    change: 0,
    changePercent: 0,
    summary: 'No data available',
    lastUpdated: new Date(),
    sources: { youtube: 0, twitter: 0, reddit: 0 },
    factors: [],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text">{displaySignal.ticker}</h1>
              <p className="text-sm text-muted">{displaySignal.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchSignal(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsWatchlisted(!isWatchlisted)}>
              <Star className={cn('w-5 h-5', isWatchlisted && 'fill-hold text-hold')} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Signal Hero */}
        <div
          className={cn(
            'rounded-2xl p-8 text-center mb-6 border',
            displaySignal.signal === 'buy' && 'bg-buy/5 border-buy/20 signal-glow-buy',
            displaySignal.signal === 'sell' && 'bg-sell/5 border-sell/20 signal-glow-sell',
            displaySignal.signal === 'hold' && 'bg-hold/5 border-hold/20 signal-glow-hold'
          )}
        >
          <SignalBadge signal={displaySignal.signal} size="xl" className="mb-4" />

          <div className="flex items-baseline justify-center gap-4 mb-4">
            <span className="text-4xl md:text-5xl font-mono font-bold text-text">
              {formatPrice(displaySignal.price)}
            </span>
            {displaySignal.changePercent !== 0 && (
              <span
                className={cn(
                  'text-xl font-mono font-medium',
                  displaySignal.change >= 0 ? 'text-buy' : 'text-sell'
                )}
              >
                {formatPercent(displaySignal.changePercent)}
              </span>
            )}
          </div>

          <ConfidenceBar value={displaySignal.confidence} size="lg" className="max-w-md mx-auto" />

          <p className="text-muted mt-4 text-sm">
            {displaySignal.price > 0 ? 'Market Open • NASDAQ • ' : ''}
            Updated {formatTimeAgo(displaySignal.lastUpdated)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          {(['overview', 'sources', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab ? 'text-primary' : 'text-muted hover:text-text'
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Summary */}
            <Card className="p-5">
              <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs">AI</span>
                </span>
                Summary
              </h3>
              <p className="text-muted leading-relaxed">{displaySignal.summary}</p>
            </Card>

            {/* Key Factors */}
            <Card className="p-5">
              <h3 className="font-semibold text-text mb-4">Key Factors</h3>
              <div className="space-y-3">
                {displaySignal.factors.length > 0 ? (
                  displaySignal.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-hover/50"
                    >
                      <div className="flex items-center gap-3">
                        {factor.type === 'positive' && <CheckCircle2 className="w-5 h-5 text-buy" />}
                        {factor.type === 'negative' && <XCircle className="w-5 h-5 text-sell" />}
                        {factor.type === 'neutral' && <Clock className="w-5 h-5 text-muted" />}
                        <span className="text-text">{factor.label}</span>
                      </div>
                      <span
                        className={cn(
                          'font-mono text-sm',
                          factor.type === 'positive' && 'text-buy',
                          factor.type === 'negative' && 'text-sell',
                          factor.type === 'neutral' && 'text-muted'
                        )}
                      >
                        {factor.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm">No factors available</p>
                )}
              </div>
            </Card>

            {/* Sources Summary */}
            <Card className="p-5">
              <h3 className="font-semibold text-text mb-4">Sources Analyzed</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-surface-hover/50">
                  <Youtube className="w-6 h-6 text-sell mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text">{displaySignal.sources.youtube}</p>
                  <p className="text-xs text-muted">YouTube</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-surface-hover/50">
                  <Twitter className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text">{displaySignal.sources.twitter}</p>
                  <p className="text-xs text-muted">Twitter</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-surface-hover/50">
                  <MessageSquare className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text">{displaySignal.sources.reddit}</p>
                  <p className="text-xs text-muted">Reddit</p>
                </div>
              </div>
            </Card>

            {/* Performance */}
            {history.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-text mb-4">Signal History</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-text">{winRate}%</p>
                    <p className="text-sm text-muted">Win Rate (7-day)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono text-text">{history.length}</p>
                    <p className="text-sm text-muted">Total Signals</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className={cn(
                        'flex-1 h-2 rounded-full',
                        h.result === 'win' && 'bg-buy',
                        h.result === 'loss' && 'bg-sell',
                        h.result === 'pending' && 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
            {/* Source Type Tabs */}
            <div className="flex gap-2 mb-4">
              <Button variant="secondary" size="sm">
                <Youtube className="w-4 h-4 mr-2" />
                YouTube ({displaySignal.sources.youtube})
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter ({displaySignal.sources.twitter})
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Reddit ({displaySignal.sources.reddit})
              </Button>
            </div>

            {/* Source List */}
            {sources.length > 0 ? (
              sources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        source.type === 'youtube' && 'bg-sell/10',
                        source.type === 'twitter' && 'bg-primary/10',
                        source.type === 'reddit' && 'bg-orange-500/10'
                      )}
                    >
                      {source.type === 'youtube' && <Youtube className="w-5 h-5 text-sell" />}
                      {source.type === 'twitter' && <Twitter className="w-5 h-5 text-primary" />}
                      {source.type === 'reddit' && <MessageSquare className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text truncate">{source.title}</h4>
                      <p className="text-sm text-muted">{source.author}</p>
                      {source.snippet && (
                        <p className="text-sm text-muted mt-2 line-clamp-2">
                          &quot;{source.snippet}&quot;
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                        <span
                          className={cn(
                            source.sentiment > 0
                              ? 'text-buy'
                              : source.sentiment < 0
                                ? 'text-sell'
                                : 'text-muted'
                          )}
                        >
                          Sentiment: {(source.sentiment * 100).toFixed(0)}%
                        </span>
                        <span>{formatTimeAgo(source.publishedAt)}</span>
                      </div>
                    </div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted">No sources available</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">No signal history available yet</p>
              </Card>
            ) : (
              history.map((h) => (
                <Card key={h.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SignalBadge signal={h.signal} size="sm" />
                      <div>
                        <p className="font-medium text-text">{formatTimeAgo(h.createdAt)}</p>
                        <p className="text-sm text-muted">Confidence: {h.confidence}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-text">{formatPrice(h.priceAtSignal)}</p>
                      {h.priceAfter7Days && (
                        <p
                          className={cn(
                            'text-sm font-mono',
                            h.priceAfter7Days - h.priceAtSignal >= 0 ? 'text-buy' : 'text-sell'
                          )}
                        >
                          {formatPercent(
                            ((h.priceAfter7Days - h.priceAtSignal) / h.priceAtSignal) * 100
                          )}
                        </p>
                      )}
                      {h.result && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            h.result === 'win' && 'bg-buy/10 text-buy',
                            h.result === 'loss' && 'bg-sell/10 text-sell',
                            h.result === 'pending' && 'bg-muted/10 text-muted'
                          )}
                        >
                          {h.result.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-4 bg-sell/5 border border-sell/20 rounded-lg mt-8">
          <AlertTriangle className="w-5 h-5 text-sell flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted">
              <strong className="text-text">Not Financial Advice:</strong> This analysis is generated
              by AI and should not be considered investment advice. Past performance does not
              guarantee future results. Always conduct your own research before making investment
              decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
