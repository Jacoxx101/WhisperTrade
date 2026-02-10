// src/lib/services/signal-aggregator.ts
// Signal Aggregation Engine - combines all sentiment sources

import NodeCache from 'node-cache';
import {
  getStockPrice,
  StockPriceData,
} from '@/lib/api/alphavantage';
import {
  extractVideoContentForSentiment,
} from '@/lib/api/youtube';
import {
  extractTweetContentForSentiment,
  isTwitterConfigured,
} from '@/lib/api/twitter';
import {
  extractRedditContentForSentiment,
  isRedditConfigured,
} from '@/lib/api/reddit';
import {
  analyzeAggregatedSentiment,
  generateTradingSignal,
  isOpenAIConfigured,
} from '@/lib/api/openai';
import { StockSignal, SignalType } from '@/types';

// Cache configuration
const cache = new NodeCache({ stdTTL: 180, checkperiod: 60 }); // 3 minutes cache

export interface AggregatedSignal {
  ticker: string;
  signal: SignalType;
  confidence: number;
  sentimentScore: number;
  summary: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  sources: {
    youtube: { count: number; sentiment: number; weight: number };
    twitter: { count: number; sentiment: number; weight: number };
    reddit: { count: number; sentiment: number; weight: number };
  };
  factors: Array<{ type: 'positive' | 'negative' | 'neutral'; label: string; value: string }>;
  rawData: {
    youtube?: any[];
    twitter?: any[];
    reddit?: any[];
  };
}

export interface AggregationConfig {
  useYouTube: boolean;
  useTwitter: boolean;
  useReddit: boolean;
  maxYouTubeVideos: number;
  maxTweets: number;
  maxRedditPosts: number;
  youtubeWeight: number;
  twitterWeight: number;
  redditWeight: number;
}

const defaultConfig: AggregationConfig = {
  useYouTube: true,
  useTwitter: true,
  useReddit: true,
  maxYouTubeVideos: 5,
  maxTweets: 20,
  maxRedditPosts: 10,
  youtubeWeight: 0.35,
  twitterWeight: 0.35,
  redditWeight: 0.3,
};

/**
 * Aggregate sentiment signals from all sources
 */
export async function aggregateSignal(
  ticker: string,
  config: Partial<AggregationConfig> = {}
): Promise<AggregatedSignal> {
  const mergedConfig = { ...defaultConfig, ...config };
  const normalizedTicker = ticker.toUpperCase();
  const cacheKey = `signal:${normalizedTicker}`;
  
  // Check cache
  const cached = cache.get<AggregatedSignal>(cacheKey);
  if (cached) {
    console.log(`[Aggregator] Cache hit for ${normalizedTicker}`);
    return cached;
  }
  
  console.log(`[Aggregator] Generating signal for ${normalizedTicker}`);
  
  try {
    // Fetch all data in parallel
    const [priceData, youtubeData, twitterData, redditData] = await Promise.allSettled([
      // Stock price
      getStockPrice(normalizedTicker),
      
      // YouTube content
      mergedConfig.useYouTube
        ? extractVideoContentForSentiment(normalizedTicker, mergedConfig.maxYouTubeVideos)
        : Promise.resolve([]),
      
      // Twitter content
      mergedConfig.useTwitter && isTwitterConfigured()
        ? extractTweetContentForSentiment(normalizedTicker, mergedConfig.maxTweets)
        : Promise.resolve([]),
      
      // Reddit content
      mergedConfig.useReddit
        ? extractRedditContentForSentiment(normalizedTicker, mergedConfig.maxRedditPosts)
        : Promise.resolve([]),
    ]);
    
    // Extract results
    const stockPrice = priceData.status === 'fulfilled' ? priceData.value : null;
    const youtubeContent = youtubeData.status === 'fulfilled' ? youtubeData.value : [];
    const twitterContent = twitterData.status === 'fulfilled' ? twitterData.value : [];
    const redditContent = redditData.status === 'fulfilled' ? redditData.value : [];
    
    // Log results
    console.log(`[Aggregator] ${normalizedTicker}: Price=${stockPrice ? '✓' : '✗'}, YouTube=${youtubeContent.length}, Twitter=${twitterContent.length}, Reddit=${redditContent.length}`);
    
    // Calculate source availability
    const availableSources = [
      youtubeContent.length > 0 && mergedConfig.useYouTube,
      twitterContent.length > 0 && mergedConfig.useTwitter,
      redditContent.length > 0 && mergedConfig.useReddit,
    ].filter(Boolean).length;
    
    if (availableSources === 0 && !stockPrice) {
      throw new Error(`No data available for ${normalizedTicker}`);
    }
    
    let sentimentResult: {
      overallSentiment: 'bullish' | 'bearish' | 'neutral';
      overallScore: number;
      overallConfidence: number;
      summary: string;
      factors: Array<{ type: 'positive' | 'negative' | 'neutral'; label: string; value: string }>;
      sourceBreakdown: {
        youtube: { sentiment: string; score: number; weight: number };
        twitter: { sentiment: string; score: number; weight: number };
        reddit: { sentiment: string; score: number; weight: number };
      };
    };
    
    // If OpenAI is configured, use it for analysis
    if (isOpenAIConfigured() && availableSources > 0) {
      try {
        sentimentResult = await analyzeAggregatedSentiment({
          ticker: normalizedTicker,
          youtubeContent: youtubeContent.map(y => ({
            title: y.title,
            description: y.description,
            comments: y.comments,
            engagement: y.engagement,
          })),
          twitterContent: twitterContent.map(t => ({
            text: t.text,
            engagement: t.engagement,
            authorFollowers: t.authorFollowers,
          })),
          redditContent: redditContent.map(r => ({
            title: r.title,
            content: r.content,
            comments: r.comments,
            engagement: r.engagement,
            subreddit: r.subreddit,
          })),
          stockPrice: stockPrice ? {
            price: stockPrice.price,
            changePercent: stockPrice.changePercent,
          } : undefined,
        });
      } catch (error) {
        console.error('[Aggregator] OpenAI analysis failed, using fallback:', error);
        sentimentResult = calculateFallbackSentiment(
          youtubeContent,
          twitterContent,
          redditContent,
          mergedConfig
        );
      }
    } else {
      // Use fallback calculation
      sentimentResult = calculateFallbackSentiment(
        youtubeContent,
        twitterContent,
        redditContent,
        mergedConfig
      );
    }
    
    // Generate trading signal
    const tradingSignal = await generateTradingSignal(
      normalizedTicker,
      sentimentResult.overallScore,
      sentimentResult.overallConfidence,
      stockPrice || undefined
    );
    
    // Build aggregated signal
    const aggregatedSignal: AggregatedSignal = {
      ticker: normalizedTicker,
      signal: tradingSignal.signal,
      confidence: Math.round(tradingSignal.confidence),
      sentimentScore: sentimentResult.overallScore,
      summary: sentimentResult.summary || tradingSignal.reasoning,
      price: stockPrice?.price || 0,
      change: stockPrice?.change || 0,
      changePercent: stockPrice?.changePercent || 0,
      lastUpdated: new Date(),
      sources: {
        youtube: {
          count: youtubeContent.length,
          sentiment: sentimentResult.sourceBreakdown.youtube.score,
          weight: sentimentResult.sourceBreakdown.youtube.weight,
        },
        twitter: {
          count: twitterContent.length,
          sentiment: sentimentResult.sourceBreakdown.twitter.score,
          weight: sentimentResult.sourceBreakdown.twitter.weight,
        },
        reddit: {
          count: redditContent.length,
          sentiment: sentimentResult.sourceBreakdown.reddit.score,
          weight: sentimentResult.sourceBreakdown.reddit.weight,
        },
      },
      factors: sentimentResult.factors.length > 0
        ? sentimentResult.factors
        : generateDefaultFactors(sentimentResult.overallScore, availableSources),
      rawData: {
        youtube: youtubeContent,
        twitter: twitterContent,
        reddit: redditContent,
      },
    };
    
    // Cache the result
    cache.set(cacheKey, aggregatedSignal);
    
    return aggregatedSignal;
  } catch (error) {
    console.error(`[Aggregator] Error generating signal for ${normalizedTicker}:`, error);
    
    // Return a fallback signal
    return createFallbackSignal(normalizedTicker, error as Error);
  }
}

/**
 * Calculate sentiment using fallback algorithm (rule-based)
 */
function calculateFallbackSentiment(
  youtubeContent: any[],
  twitterContent: any[],
  redditContent: any[],
  config: AggregationConfig
): {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  overallScore: number;
  overallConfidence: number;
  summary: string;
  factors: Array<{ type: 'positive' | 'negative' | 'neutral'; label: string; value: string }>;
  sourceBreakdown: {
    youtube: { sentiment: string; score: number; weight: number };
    twitter: { sentiment: string; score: number; weight: number };
    reddit: { sentiment: string; score: number; weight: number };
  };
} {
  // Simple keyword-based analysis
  const bullishKeywords = ['buy', 'bullish', 'moon', 'rocket', '🚀', 'calls', 'long', 'green', 'pump', 'breakout'];
  const bearishKeywords = ['sell', 'bearish', 'crash', 'dump', 'puts', 'short', 'red', 'crash', 'falling'];
  
  function analyzeText(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    bullishKeywords.forEach(word => {
      if (lowerText.includes(word)) score += 0.1;
    });
    
    bearishKeywords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }
  
  // Analyze YouTube
  let youtubeScore = 0;
  if (youtubeContent.length > 0) {
    const scores = youtubeContent.map(y => {
      const text = `${y.title} ${y.description} ${y.comments.join(' ')}`;
      return analyzeText(text);
    });
    youtubeScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  // Analyze Twitter
  let twitterScore = 0;
  if (twitterContent.length > 0) {
    const scores = twitterContent.map(t => analyzeText(t.text));
    twitterScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  // Analyze Reddit
  let redditScore = 0;
  if (redditContent.length > 0) {
    const scores = redditContent.map(r => {
      const text = `${r.title} ${r.content} ${r.comments.join(' ')}`;
      return analyzeText(text);
    });
    redditScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  // Weight the scores
  const totalWeight = (youtubeContent.length > 0 ? config.youtubeWeight : 0) +
                      (twitterContent.length > 0 ? config.twitterWeight : 0) +
                      (redditContent.length > 0 ? config.redditWeight : 0);
  
  let weightedScore = 0;
  if (totalWeight > 0) {
    weightedScore = (
      (youtubeContent.length > 0 ? youtubeScore * config.youtubeWeight : 0) +
      (twitterContent.length > 0 ? twitterScore * config.twitterWeight : 0) +
      (redditContent.length > 0 ? redditScore * config.redditWeight : 0)
    ) / totalWeight;
  }
  
  // Determine sentiment
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (weightedScore > 0.2) sentiment = 'bullish';
  else if (weightedScore < -0.2) sentiment = 'bearish';
  
  // Calculate confidence based on data volume
  const totalItems = youtubeContent.length + twitterContent.length + redditContent.length;
  const confidence = Math.min(0.9, 0.3 + (totalItems / 50) * 0.6);
  
  return {
    overallSentiment: sentiment,
    overallScore: weightedScore,
    overallConfidence: confidence,
    summary: `Based on ${totalItems} social media mentions`,
    factors: generateDefaultFactors(weightedScore, totalItems),
    sourceBreakdown: {
      youtube: {
        sentiment: youtubeScore > 0 ? 'bullish' : youtubeScore < 0 ? 'bearish' : 'neutral',
        score: youtubeScore,
        weight: config.youtubeWeight,
      },
      twitter: {
        sentiment: twitterScore > 0 ? 'bullish' : twitterScore < 0 ? 'bearish' : 'neutral',
        score: twitterScore,
        weight: config.twitterWeight,
      },
      reddit: {
        sentiment: redditScore > 0 ? 'bullish' : redditScore < 0 ? 'bearish' : 'neutral',
        score: redditScore,
        weight: config.redditWeight,
      },
    },
  };
}

/**
 * Generate default factors when AI analysis is not available
 */
function generateDefaultFactors(
  sentimentScore: number,
  sourceCount: number
): Array<{ type: 'positive' | 'negative' | 'neutral'; label: string; value: string }> {
  const factors: Array<{ type: 'positive' | 'negative' | 'neutral'; label: string; value: string }> = [];
  
  // Social media volume factor
  if (sourceCount > 20) {
    factors.push({
      type: sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral',
      label: 'Social Volume',
      value: sentimentScore > 0 ? `+${Math.round(sourceCount / 10)}%` : `${Math.round(sourceCount / 10)}%`,
    });
  }
  
  // Sentiment direction
  if (Math.abs(sentimentScore) > 0.3) {
    factors.push({
      type: sentimentScore > 0 ? 'positive' : 'negative',
      label: 'Sentiment Direction',
      value: sentimentScore > 0 ? 'Bullish' : 'Bearish',
    });
  }
  
  // Source count
  factors.push({
    type: 'neutral',
    label: 'Data Sources',
    value: `${sourceCount} mentions`,
  });
  
  return factors;
}

/**
 * Create a fallback signal when errors occur
 */
function createFallbackSignal(ticker: string, error: Error): AggregatedSignal {
  return {
    ticker,
    signal: 'hold',
    confidence: 0,
    sentimentScore: 0,
    summary: `Unable to analyze sentiment: ${error.message}`,
    price: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: new Date(),
    sources: {
      youtube: { count: 0, sentiment: 0, weight: 0.35 },
      twitter: { count: 0, sentiment: 0, weight: 0.35 },
      reddit: { count: 0, sentiment: 0, weight: 0.3 },
    },
    factors: [
      { type: 'neutral', label: 'Status', value: 'Data unavailable' },
    ],
    rawData: {},
  };
}

/**
 * Convert AggregatedSignal to StockSignal format
 */
export function toStockSignal(
  aggregated: AggregatedSignal,
  name: string,
  id: string
): StockSignal {
  return {
    id,
    ticker: aggregated.ticker,
    name,
    signal: aggregated.signal,
    confidence: aggregated.confidence,
    price: aggregated.price,
    change: aggregated.change,
    changePercent: aggregated.changePercent,
    summary: aggregated.summary,
    lastUpdated: aggregated.lastUpdated,
    sources: {
      youtube: aggregated.sources.youtube.count,
      twitter: aggregated.sources.twitter.count,
      reddit: aggregated.sources.reddit.count,
    },
    factors: aggregated.factors,
  };
}

/**
 * Get multiple signals in batch
 */
export async function getBatchSignals(
  tickers: string[],
  config?: Partial<AggregationConfig>
): Promise<AggregatedSignal[]> {
  const signals = await Promise.all(
    tickers.map(ticker => aggregateSignal(ticker, config))
  );
  
  return signals;
}

/**
 * Clear cache for a specific ticker
 */
export function clearSignalCache(ticker?: string): void {
  if (ticker) {
    cache.del(`signal:${ticker.toUpperCase()}`);
  } else {
    cache.flushAll();
  }
}

/**
 * Get cache stats
 */
export function getCacheStats(): { keys: number; hits: number; misses: number } {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
  };
}

export { cache };
