// src/lib/api-client.ts
// Client-side API utilities for fetching data

import { StockSignal, TrendingStock, Alert } from '@/types';

const API_BASE = '/api';

// Error handling wrapper
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Request failed' };
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Stock Price API
export async function getStockPrice(ticker: string) {
  return fetchAPI(`${API_BASE}/stock/${ticker}/price`);
}

// Sentiment APIs
export async function getYouTubeSentiment(ticker: string, maxResults?: number) {
  const params = new URLSearchParams({ ticker });
  if (maxResults) params.set('max', maxResults.toString());
  return fetchAPI(`${API_BASE}/sentiment/youtube?${params}`);
}

export async function getTwitterSentiment(ticker: string, maxResults?: number) {
  const params = new URLSearchParams({ ticker });
  if (maxResults) params.set('max', maxResults.toString());
  return fetchAPI(`${API_BASE}/sentiment/twitter?${params}`);
}

export async function getRedditSentiment(ticker: string, maxResults?: number) {
  const params = new URLSearchParams({ ticker });
  if (maxResults) params.set('max', maxResults.toString());
  return fetchAPI(`${API_BASE}/sentiment/reddit?${params}`);
}

// Signal API
export async function getSignal(ticker: string): Promise<{ success: boolean; data?: StockSignal; error?: string }> {
  return fetchAPI<StockSignal>(`${API_BASE}/signal?ticker=${encodeURIComponent(ticker)}`);
}

export async function getBatchSignals(tickers: string[]): Promise<{ success: boolean; data?: StockSignal[]; error?: string }> {
  return fetchAPI<StockSignal[]>(`${API_BASE}/signal?tickers=${encodeURIComponent(tickers.join(','))}`);
}

export async function analyzeTicker(ticker: string, config?: object): Promise<{ success: boolean; data?: StockSignal; error?: string }> {
  return fetchAPI<StockSignal>(`${API_BASE}/signal`, {
    method: 'POST',
    body: JSON.stringify({ ticker, config }),
  });
}

// Polling utility for auto-refresh
export function createPoller<T>(
  fetchFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  intervalMs: number = 60000,
  onUpdate?: (data: T) => void,
  onError?: (error: string) => void
) {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  
  const poll = async () => {
    const result = await fetchFn();
    if (result.success && result.data) {
      onUpdate?.(result.data);
    } else if (result.error) {
      onError?.(result.error);
    }
  };
  
  const start = () => {
    if (intervalId) return;
    poll(); // Initial fetch
    intervalId = setInterval(poll, intervalMs);
  };
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  return { start, stop, poll };
}
