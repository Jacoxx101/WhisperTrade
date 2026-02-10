// src/app/api/stock/[ticker]/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStockPrice } from '@/lib/api/alphavantage';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params;
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }
    
    const priceData = await getStockPrice(ticker);
    
    return NextResponse.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    console.error('[API] Stock price error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock price';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
