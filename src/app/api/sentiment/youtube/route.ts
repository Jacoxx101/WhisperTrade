// src/app/api/sentiment/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  searchVideosByTicker,
  extractVideoContentForSentiment,
} from '@/lib/api/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const maxResults = parseInt(searchParams.get('max') || '10');
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }
    
    // Fetch videos and content for sentiment
    const [videoResults, contentForSentiment] = await Promise.all([
      searchVideosByTicker(ticker, maxResults),
      extractVideoContentForSentiment(ticker, 5),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        ticker: ticker.toUpperCase(),
        videos: videoResults.videos,
        totalResults: videoResults.totalResults,
        contentForAnalysis: contentForSentiment,
      },
    });
  } catch (error) {
    console.error('[API] YouTube sentiment error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch YouTube data';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
