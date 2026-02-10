// src/lib/api/youtube.ts
// YouTube Data API integration for sentiment analysis
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import NodeCache from 'node-cache';

// YouTube API configuration
const API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyARZsPRNG0CZOYHmE7qSoh1hrlVjQcFX3Y';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Cache configuration
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 minutes

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  url: string;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  totalResults: number;
  nextPageToken?: string;
}

/**
 * Search for videos mentioning a stock ticker
 */
export async function searchVideosByTicker(
  ticker: string,
  maxResults: number = 10
): Promise<YouTubeSearchResult> {
  const normalizedTicker = ticker.toUpperCase().replace('$', '');
  const cacheKey = `youtube:${normalizedTicker}:${maxResults}`;
  
  // Check cache
  const cached = cache.get<YouTubeSearchResult>(cacheKey);
  if (cached) {
    console.log(`[YouTube] Cache hit for ${normalizedTicker}`);
    return cached;
  }
  
  try {
    console.log(`[YouTube] Searching for ${normalizedTicker}`);
    
    // Search for videos with ticker mention
    const searchQuery = `${normalizedTicker} stock OR ${normalizedTicker} investing OR $${normalizedTicker}`;
    
    const searchResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        order: 'date', // Most recent first
        maxResults: maxResults,
        publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        key: API_KEY,
      },
      timeout: 10000,
    });
    
    const items = searchResponse.data.items || [];
    const videoIds = items.map((item: any) => item.id.videoId).join(',');
    
    if (!videoIds) {
      return { videos: [], totalResults: 0 };
    }
    
    // Get video statistics
    const statsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics,snippet',
        id: videoIds,
        key: API_KEY,
      },
      timeout: 10000,
    });
    
    const statsItems = statsResponse.data.items || [];
    
    const videos: YouTubeVideo[] = statsItems.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      viewCount: parseInt(item.statistics.viewCount || '0'),
      likeCount: parseInt(item.statistics.likeCount || '0'),
      commentCount: parseInt(item.statistics.commentCount || '0'),
      url: `https://www.youtube.com/watch?v=${item.id}`,
    }));
    
    const result: YouTubeSearchResult = {
      videos,
      totalResults: searchResponse.data.pageInfo?.totalResults || videos.length,
      nextPageToken: searchResponse.data.nextPageToken,
    };
    
    // Cache the result
    cache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.error('[YouTube] Quota exceeded or API key invalid');
        throw new Error('YouTube API quota exceeded. Please try again later.');
      }
      console.error('[YouTube] API error:', error.message);
      throw new Error(`YouTube API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get comments for a specific video
 */
export async function getVideoComments(
  videoId: string,
  maxResults: number = 20
): Promise<Array<{ author: string; text: string; likeCount: number; publishedAt: string }>> {
  const cacheKey = `comments:${videoId}:${maxResults}`;
  
  const cached = cache.get<Array<{ author: string; text: string; likeCount: number; publishedAt: string }>>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/commentThreads`, {
      params: {
        part: 'snippet',
        videoId: videoId,
        maxResults: maxResults,
        order: 'relevance',
        key: API_KEY,
      },
      timeout: 10000,
    });
    
    const items = response.data.items || [];
    const comments = items.map((item: any) => ({
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
    }));
    
    cache.set(cacheKey, comments, 600);
    
    return comments;
  } catch (error) {
    console.error('[YouTube] Comments error:', error);
    return [];
  }
}

/**
 * Get channel details
 */
export async function getChannelDetails(channelId: string): Promise<{
  title: string;
  subscriberCount: number;
  videoCount: number;
}> {
  const cacheKey = `channel:${channelId}`;
  
  const cached = cache.get<{ title: string; subscriberCount: number; videoCount: number }>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/channels`, {
      params: {
        part: 'statistics,snippet',
        id: channelId,
        key: API_KEY,
      },
      timeout: 10000,
    });
    
    const channel = response.data.items?.[0];
    
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    const result = {
      title: channel.snippet.title,
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
      videoCount: parseInt(channel.statistics.videoCount || '0'),
    };
    
    cache.set(cacheKey, result, 3600); // Cache for 1 hour
    
    return result;
  } catch (error) {
    console.error('[YouTube] Channel error:', error);
    return { title: '', subscriberCount: 0, videoCount: 0 };
  }
}

/**
 * Extract text content from videos for sentiment analysis
 */
export async function extractVideoContentForSentiment(
  ticker: string,
  maxVideos: number = 5
): Promise<Array<{
  source: 'youtube';
  id: string;
  title: string;
  description: string;
  comments: string[];
  engagement: number;
  publishedAt: string;
  author: string;
  url: string;
}>> {
  try {
    const { videos } = await searchVideosByTicker(ticker, maxVideos);
    
    const results = await Promise.all(
      videos.map(async (video) => {
        const comments = await getVideoComments(video.id, 10);
        
        return {
          source: 'youtube' as const,
          id: video.id,
          title: video.title,
          description: video.description,
          comments: comments.map(c => c.text),
          engagement: video.viewCount + video.likeCount * 10 + video.commentCount * 20,
          publishedAt: video.publishedAt,
          author: video.channelTitle,
          url: video.url,
        };
      })
    );
    
    return results;
  } catch (error) {
    console.error('[YouTube] Content extraction error:', error);
    return [];
  }
}

export { cache };
