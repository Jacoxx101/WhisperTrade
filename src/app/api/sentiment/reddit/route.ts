// src/app/api/sentiment/reddit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  searchPostsByTicker,
  extractRedditContentForSentiment,
  isRedditConfigured,
} from '@/lib/api/reddit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const maxResults = parseInt(searchParams.get('max') || '15');
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }
    
    // Fetch posts and content for sentiment
    const [postResults, contentForSentiment] = await Promise.all([
      searchPostsByTicker(ticker, maxResults),
      extractRedditContentForSentiment(ticker, 10),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        ticker: ticker.toUpperCase(),
        posts: postResults.posts,
        totalResults: postResults.totalResults,
        contentForAnalysis: contentForSentiment,
        configured: isRedditConfigured(),
      },
    });
  } catch (error) {
    console.error('[API] Reddit sentiment error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Reddit data';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
