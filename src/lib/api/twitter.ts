// src/lib/api/twitter.ts
// Twitter/X API integration for sentiment analysis

import axios from 'axios';
import NodeCache from 'node-cache';

// Twitter API v2 configuration
// Note: User needs to add their own Twitter API bearer token
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';
const BASE_URL = 'https://api.twitter.com/2';

// Cache configuration
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes

export interface TwitterTweet {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorFollowersCount: number;
  authorVerified: boolean;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  url: string;
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
  };
}

export interface TwitterSearchResult {
  tweets: TwitterTweet[];
  totalResults: number;
  nextToken?: string;
}

/**
 * Check if Twitter API is configured
 */
export function isTwitterConfigured(): boolean {
  return !!BEARER_TOKEN && BEARER_TOKEN.length > 0;
}

/**
 * Search for tweets by cashtag (e.g., $AAPL)
 */
export async function searchTweetsByCashtag(
  ticker: string,
  maxResults: number = 20
): Promise<TwitterSearchResult> {
  const normalizedTicker = ticker.toUpperCase().replace('$', '');
  const cashtag = `$${normalizedTicker}`;
  const cacheKey = `twitter:${normalizedTicker}:${maxResults}`;
  
  // Check cache
  const cached = cache.get<TwitterSearchResult>(cacheKey);
  if (cached) {
    console.log(`[Twitter] Cache hit for ${normalizedTicker}`);
    return cached;
  }
  
  if (!isTwitterConfigured()) {
    console.warn('[Twitter] API not configured. Set TWITTER_BEARER_TOKEN environment variable.');
    return { tweets: [], totalResults: 0 };
  }
  
  try {
    console.log(`[Twitter] Searching for ${cashtag}`);
    
    const response = await axios.get(`${BASE_URL}/tweets/search/recent`, {
      params: {
        query: `${cashtag} -is:retweet lang:en`,
        max_results: Math.min(maxResults, 100),
        'tweet.fields': 'created_at,public_metrics,author_id',
        'user.fields': 'public_metrics,verified,username,display_name',
        expansions: 'author_id',
      },
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      timeout: 15000,
    });
    
    const tweets = response.data.data || [];
    const users: TwitterUser[] = response.data.includes?.users || [];
    
    // Create user lookup map
    const userMap = new Map(users.map((u: TwitterUser) => [u.id, u]));
    
    const formattedTweets: TwitterTweet[] = tweets.map((tweet: any) => {
      const user = userMap.get(tweet.author_id);
      
      return {
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id,
        authorName: user?.name ?? 'Unknown',
        authorUsername: user?.username ?? 'unknown',
        authorFollowersCount: user?.public_metrics?.followers_count ?? 0,
        authorVerified: user?.verified ?? false,
        createdAt: tweet.created_at,
        likeCount: tweet.public_metrics?.like_count ?? 0,
        retweetCount: tweet.public_metrics?.retweet_count ?? 0,
        replyCount: tweet.public_metrics?.reply_count ?? 0,
        quoteCount: tweet.public_metrics?.quote_count ?? 0,
        url: `https://twitter.com/${user?.username ?? 'unknown'}/status/${tweet.id}`,
      };
    });
    
    const result: TwitterSearchResult = {
      tweets: formattedTweets,
      totalResults: formattedTweets.length,
      nextToken: response.data.meta?.next_token,
    };
    
    // Cache the result
    cache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('[Twitter] Unauthorized. Check your bearer token.');
        throw new Error('Twitter API authentication failed. Please check your credentials.');
      }
      if (error.response?.status === 429) {
        console.error('[Twitter] Rate limit exceeded');
        throw new Error('Twitter API rate limit exceeded. Please try again later.');
      }
      console.error('[Twitter] API error:', error.message);
      throw new Error(`Twitter API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get user information by ID
 */
export async function getUserById(userId: string): Promise<{
  id: string;
  name: string;
  username: string;
  followersCount: number;
  verified: boolean;
} | null> {
  if (!isTwitterConfigured()) {
    return null;
  }
  
  const cacheKey = `user:${userId}`;
  const cached = cache.get<{ id: string; name: string; username: string; followersCount: number; verified: boolean }>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, {
      params: {
        'user.fields': 'public_metrics,verified',
      },
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      timeout: 10000,
    });
    
    const user = response.data.data;
    
    const result = {
      id: user.id,
      name: user.name,
      username: user.username,
      followersCount: user.public_metrics?.followers_count || 0,
      verified: user.verified || false,
    };
    
    cache.set(cacheKey, result, 3600); // Cache for 1 hour
    
    return result;
  } catch (error) {
    console.error('[Twitter] User fetch error:', error);
    return null;
  }
}

/**
 * Extract tweet content for sentiment analysis
 */
export async function extractTweetContentForSentiment(
  ticker: string,
  maxTweets: number = 20
): Promise<Array<{
  source: 'twitter';
  id: string;
  text: string;
  engagement: number;
  publishedAt: string;
  author: string;
  authorFollowers: number;
  authorVerified: boolean;
  url: string;
}>> {
  try {
    const { tweets } = await searchTweetsByCashtag(ticker, maxTweets);
    
    return tweets.map(tweet => ({
      source: 'twitter' as const,
      id: tweet.id,
      text: tweet.text,
      engagement: tweet.likeCount + tweet.retweetCount * 2 + tweet.replyCount + tweet.quoteCount,
      publishedAt: tweet.createdAt,
      author: tweet.authorName,
      authorFollowers: tweet.authorFollowersCount,
      authorVerified: tweet.authorVerified,
      url: tweet.url,
    }));
  } catch (error) {
    console.error('[Twitter] Content extraction error:', error);
    return [];
  }
}

/**
 * Get trending financial hashtags (requires elevated access)
 */
export async function getTrendingFinancialTopics(): Promise<string[]> {
  if (!isTwitterConfigured()) {
    return [];
  }
  
  // Note: This requires elevated access which most free tiers don't have
  // Returning mock data for now
  return [
    '#StockMarket',
    '#Investing',
    '#Trading',
    '#Stocks',
    '#Finance',
    '#WallStreet',
    '#Crypto',
    '#Bitcoin',
    '$SPY',
    '$QQQ',
  ];
}

export { cache };
