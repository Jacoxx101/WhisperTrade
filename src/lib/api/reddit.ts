// src/lib/api/reddit.ts
// Reddit API integration for sentiment analysis

import axios from 'axios';
import NodeCache from 'node-cache';

// Reddit API configuration
// Note: User needs to add their own Reddit app credentials
const CLIENT_ID = process.env.REDDIT_CLIENT_ID || '';
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || '';
const USER_AGENT = 'WhisperTrade/1.0 (Sentiment Analysis Platform)';

const BASE_URL = 'https://www.reddit.com';
const OAUTH_URL = 'https://oauth.reddit.com';

// Cache configuration
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes

// Token storage
let accessToken: string | null = null;
let tokenExpiry: number = 0;

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  permalink: string;
  url: string;
  createdAt: number;
  score: number;
  upvoteRatio: number;
  numComments: number;
  awards: number;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  createdAt: number;
  replies: RedditComment[];
}

export interface RedditSearchResult {
  posts: RedditPost[];
  totalResults: number;
  after?: string;
}

/**
 * Check if Reddit API is configured
 */
export function isRedditConfigured(): boolean {
  return !!CLIENT_ID && !!CLIENT_SECRET;
}

/**
 * Get OAuth access token
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  if (!isRedditConfigured()) {
    throw new Error('Reddit API credentials not configured');
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/access_token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET,
        },
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );
    
    accessToken = response.data.access_token;
    // Set expiry slightly before actual expiry
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    
    return accessToken!;
  } catch (error) {
    console.error('[Reddit] Token fetch error:', error);
    throw new Error('Failed to authenticate with Reddit API');
  }
}

/**
 * Search for posts mentioning a stock ticker
 */
export async function searchPostsByTicker(
  ticker: string,
  maxResults: number = 25,
  subreddits?: string[]
): Promise<RedditSearchResult> {
  const normalizedTicker = ticker.toUpperCase().replace('$', '');
  const cacheKey = `reddit:${normalizedTicker}:${maxResults}`;
  
  // Check cache
  const cached = cache.get<RedditSearchResult>(cacheKey);
  if (cached) {
    console.log(`[Reddit] Cache hit for ${normalizedTicker}`);
    return cached;
  }
  
  try {
    console.log(`[Reddit] Searching for ${normalizedTicker}`);
    
    // Build search query
    const searchQuery = subreddits && subreddits.length > 0
      ? `${normalizedTicker} subreddit:(${subreddits.join(' OR ')})`
      : `${normalizedTicker} stock OR $${normalizedTicker}`;
    
    // Use public API if not configured with OAuth
    if (!isRedditConfigured()) {
      return searchPublicReddit(normalizedTicker, maxResults);
    }
    
    const token = await getAccessToken();
    
    const response = await axios.get(`${OAUTH_URL}/search`, {
      params: {
        q: searchQuery,
        type: 'submission',
        sort: 'new',
        t: 'week', // Last week
        limit: maxResults,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': USER_AGENT,
      },
      timeout: 15000,
    });
    
    const posts = response.data.data?.children?.map((child: any) => {
      const data = child.data;
      return {
        id: data.id,
        title: data.title,
        selftext: data.selftext || '',
        author: data.author,
        subreddit: data.subreddit,
        permalink: data.permalink,
        url: `https://www.reddit.com${data.permalink}`,
        createdAt: data.created_utc,
        score: data.score,
        upvoteRatio: data.upvote_ratio,
        numComments: data.num_comments,
        awards: data.total_awards_received || 0,
      };
    }) || [];
    
    const result: RedditSearchResult = {
      posts,
      totalResults: response.data.data?.dist || posts.length,
      after: response.data.data?.after,
    };
    
    // Cache the result
    cache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('[Reddit] Search error:', error);
    // Fallback to public search
    return searchPublicReddit(normalizedTicker, maxResults);
  }
}

/**
 * Search Reddit using public API (no auth required, more limited)
 */
async function searchPublicReddit(
  ticker: string,
  maxResults: number = 25
): Promise<RedditSearchResult> {
  const defaultSubreddits = ['wallstreetbets', 'stocks', 'investing', 'StockMarket', 'options'];
  
  try {
    // Search multiple subreddits
    const searchPromises = defaultSubreddits.map(async (subreddit) => {
      try {
        const response = await axios.get(
          `${BASE_URL}/r/${subreddit}/search.json`,
          {
            params: {
              q: ticker,
              sort: 'new',
              t: 'week',
              limit: Math.min(maxResults / defaultSubreddits.length, 10),
            },
            headers: {
              'User-Agent': USER_AGENT,
            },
            timeout: 10000,
          }
        );
        
        return response.data.data?.children || [];
      } catch (e) {
        return [];
      }
    });
    
    const resultsArrays = await Promise.all(searchPromises);
    const allPosts = resultsArrays.flat();
    
    // Remove duplicates and format
    const seenIds = new Set<string>();
    const posts: RedditPost[] = [];
    
    for (const child of allPosts) {
      const data = child.data;
      if (seenIds.has(data.id)) continue;
      seenIds.add(data.id);
      
      posts.push({
        id: data.id,
        title: data.title,
        selftext: data.selftext || '',
        author: data.author,
        subreddit: data.subreddit,
        permalink: data.permalink,
        url: `https://www.reddit.com${data.permalink}`,
        createdAt: data.created_utc,
        score: data.score,
        upvoteRatio: data.upvote_ratio,
        numComments: data.num_comments,
        awards: data.total_awards_received || 0,
      });
    }
    
    // Sort by score (highest first)
    posts.sort((a, b) => b.score - a.score);
    
    return {
      posts: posts.slice(0, maxResults),
      totalResults: posts.length,
    };
  } catch (error) {
    console.error('[Reddit] Public search error:', error);
    return { posts: [], totalResults: 0 };
  }
}

/**
 * Get comments for a specific post
 */
export async function getPostComments(
  subreddit: string,
  postId: string,
  maxComments: number = 20
): Promise<RedditComment[]> {
  const cacheKey = `comments:${postId}`;
  
  const cached = cache.get<RedditComment[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const url = isRedditConfigured()
      ? `${OAUTH_URL}/r/${subreddit}/comments/${postId}.json?limit=${maxComments}`
      : `${BASE_URL}/r/${subreddit}/comments/${postId}.json?limit=${maxComments}`;
    
    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
    };
    
    if (isRedditConfigured()) {
      const token = await getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers, timeout: 15000 });
    
    const comments = response.data[1]?.data?.children || [];
    
    const formattedComments: RedditComment[] = comments
      .filter((child: any) => child.kind === 't1') // Only comments, not "more"
      .map((child: any) => {
        const data = child.data;
        return {
          id: data.id,
          body: data.body,
          author: data.author,
          score: data.score,
          createdAt: data.created_utc,
          replies: [], // Simplified - not fetching nested replies
        };
      });
    
    cache.set(cacheKey, formattedComments, 600);
    
    return formattedComments;
  } catch (error) {
    console.error('[Reddit] Comments error:', error);
    return [];
  }
}

/**
 * Get trending posts from specific subreddits
 */
export async function getTrendingFromSubreddits(
  subreddits: string[] = ['wallstreetbets', 'stocks', 'investing'],
  limit: number = 10
): Promise<RedditPost[]> {
  const cacheKey = `trending:${subreddits.join(',')}:${limit}`;
  
  const cached = cache.get<RedditPost[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const subredditList = subreddits.join('+');
    
    const url = isRedditConfigured()
      ? `${OAUTH_URL}/r/${subredditList}/hot.json?limit=${limit}`
      : `${BASE_URL}/r/${subredditList}/hot.json?limit=${limit}`;
    
    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
    };
    
    if (isRedditConfigured()) {
      const token = await getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers, timeout: 15000 });
    
    const posts = response.data.data?.children?.map((child: any) => {
      const data = child.data;
      return {
        id: data.id,
        title: data.title,
        selftext: data.selftext || '',
        author: data.author,
        subreddit: data.subreddit,
        permalink: data.permalink,
        url: `https://www.reddit.com${data.permalink}`,
        createdAt: data.created_utc,
        score: data.score,
        upvoteRatio: data.upvote_ratio,
        numComments: data.num_comments,
        awards: data.total_awards_received || 0,
      };
    }) || [];
    
    cache.set(cacheKey, posts, 600);
    
    return posts;
  } catch (error) {
    console.error('[Reddit] Trending error:', error);
    return [];
  }
}

/**
 * Extract post and comment content for sentiment analysis
 */
export async function extractRedditContentForSentiment(
  ticker: string,
  maxPosts: number = 10
): Promise<Array<{
  source: 'reddit';
  id: string;
  title: string;
  content: string;
  comments: string[];
  engagement: number;
  publishedAt: number;
  subreddit: string;
  author: string;
  url: string;
}>> {
  try {
    const { posts } = await searchPostsByTicker(ticker, maxPosts);
    
    const results = await Promise.all(
      posts.map(async (post) => {
        const comments = await getPostComments(post.subreddit, post.id, 5);
        
        return {
          source: 'reddit' as const,
          id: post.id,
          title: post.title,
          content: post.selftext,
          comments: comments.map(c => c.body),
          engagement: post.score + post.numComments * 2 + post.awards * 10,
          publishedAt: post.createdAt,
          subreddit: post.subreddit,
          author: post.author,
          url: post.url,
        };
      })
    );
    
    return results;
  } catch (error) {
    console.error('[Reddit] Content extraction error:', error);
    return [];
  }
}

export { cache };
