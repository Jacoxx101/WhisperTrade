// src/app/api/signal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  aggregateSignal,
  getBatchSignals,
  toStockSignal,
} from '@/lib/services/signal-aggregator';

// Stock name mapping (could be moved to a database or config)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const tickers = searchParams.get('tickers'); // Comma-separated list
    
    // Single ticker request
    if (ticker) {
      const aggregated = await aggregateSignal(ticker);
      const stockSignal = toStockSignal(
        aggregated,
        stockNames[aggregated.ticker] || aggregated.ticker,
        `signal-${aggregated.ticker}`
      );
      
      return NextResponse.json({
        success: true,
        data: stockSignal,
      });
    }
    
    // Batch request
    if (tickers) {
      const tickerList = tickers.split(',').map(t => t.trim().toUpperCase());
      const aggregatedSignals = await getBatchSignals(tickerList);
      
      const stockSignals = aggregatedSignals.map((agg) =>
        toStockSignal(agg, stockNames[agg.ticker] || agg.ticker, `signal-${agg.ticker}`)
      );
      
      return NextResponse.json({
        success: true,
        data: stockSignals,
      });
    }
    
    return NextResponse.json(
      { error: 'Ticker or tickers parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Signal error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate signal';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST endpoint for analyzing custom tickers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker, config } = body;
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }
    
    const aggregated = await aggregateSignal(ticker, config);
    const stockSignal = toStockSignal(
      aggregated,
      stockNames[aggregated.ticker] || aggregated.ticker,
      `signal-${aggregated.ticker}`
    );
    
    return NextResponse.json({
      success: true,
      data: stockSignal,
    });
  } catch (error) {
    console.error('[API] Signal POST error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate signal';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
