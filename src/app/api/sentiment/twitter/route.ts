// src/app/api/sentiment/twitter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  searchTweetsByCashtag,
  extractTweetContentForSentiment,
  isTwitterConfigured,
} from '@/lib/api/twitter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const maxResults = parseInt(searchParams.get('max') || '20');
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }
    
    // Check if Twitter is configured
    if (!isTwitterConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Twitter API not configured',
          message: 'Set TWITTER_BEARER_TOKEN environment variable to enable Twitter sentiment analysis',
          data: {
            ticker: ticker.toUpperCase(),
            tweets: [],
            totalResults: 0,
            configured: false,
          },
        },
        { status: 200 }
      );
    }
    
    // Fetch tweets and content for sentiment
    const [tweetResults, contentForSentiment] = await Promise.all([
      searchTweetsByCashtag(ticker, maxResults),
      extractTweetContentForSentiment(ticker, maxResults),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        ticker: ticker.toUpperCase(),
        tweets: tweetResults.tweets,
        totalResults: tweetResults.totalResults,
        contentForAnalysis: contentForSentiment,
        configured: true,
      },
    });
  } catch (error) {
    console.error('[API] Twitter sentiment error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Twitter data';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
