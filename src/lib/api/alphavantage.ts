// src/lib/api/alphavantage.ts
// Alpha Vantage Stock Price API integration
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import NodeCache from 'node-cache';

// Alpha Vantage API configuration
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '0LPF2FXTGBMALMFN';
const BASE_URL = 'https://www.alphavantage.co/query';

// Rate limiting: 5 calls per minute for free tier
const RATE_LIMIT_MS = 12000; // 12 seconds between calls (5 per minute)
let lastCallTime = 0;

// Cache configuration: 5 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export interface StockPriceData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  lastUpdated: Date;
}

interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check rate limit and wait if necessary
 */
async function checkRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastCall;
    console.log(`[Alpha Vantage] Rate limit: waiting ${waitTime}ms`);
    await sleep(waitTime);
  }
  
  lastCallTime = Date.now();
}

/**
 * Fetch stock price data from Alpha Vantage
 */
export async function getStockPrice(ticker: string): Promise<StockPriceData> {
  const normalizedTicker = ticker.toUpperCase();
  const cacheKey = `price:${normalizedTicker}`;
  
  // Check cache first
  const cached = cache.get<StockPriceData>(cacheKey);
  if (cached) {
    console.log(`[Alpha Vantage] Cache hit for ${normalizedTicker}`);
    return cached;
  }
  
  // Check rate limit
  await checkRateLimit();
  
  try {
    console.log(`[Alpha Vantage] Fetching price for ${normalizedTicker}`);
    
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: normalizedTicker,
        apikey: API_KEY,
      },
      timeout: 10000,
    });
    
    const quote = response.data['Global Quote'] as AlphaVantageQuote;
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No data found for ticker: ${normalizedTicker}`);
    }
    
    const priceData: StockPriceData = {
      ticker: normalizedTicker,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      close: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume']),
      lastUpdated: new Date(),
    };
    
    // Cache the result
    cache.set(cacheKey, priceData);
    
    return priceData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        console.error('[Alpha Vantage] Rate limit exceeded');
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      console.error('[Alpha Vantage] API error:', error.message);
      throw new Error(`Failed to fetch stock price: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Search for stock symbol
 */
export async function searchSymbol(keywords: string): Promise<Array<{ symbol: string; name: string }>> {
  const cacheKey = `search:${keywords}`;
  
  const cached = cache.get<Array<{ symbol: string; name: string }>>(cacheKey);
  if (cached) {
    return cached;
  }
  
  await checkRateLimit();
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
        apikey: API_KEY,
      },
      timeout: 10000,
    });
    
    const matches = response.data.bestMatches || [];
    const results = matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
    }));
    
    cache.set(cacheKey, results, 600); // Cache for 10 minutes
    
    return results;
  } catch (error) {
    console.error('[Alpha Vantage] Search error:', error);
    return [];
  }
}

/**
 * Get intraday data (for charts)
 */
export async function getIntradayData(
  ticker: string,
  interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
): Promise<Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }>> {
  const normalizedTicker = ticker.toUpperCase();
  const cacheKey = `intraday:${normalizedTicker}:${interval}`;
  
  const cached = cache.get<Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }>>(cacheKey);
  if (cached) {
    return cached;
  }
  
  await checkRateLimit();
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: normalizedTicker,
        interval: interval,
        apikey: API_KEY,
      },
      timeout: 10000,
    });
    
    const timeSeriesKey = `Time Series (${interval})`;
    const timeSeries = response.data[timeSeriesKey];
    
    if (!timeSeries) {
      throw new Error('No intraday data available');
    }
    
    const data = Object.entries(timeSeries).map(([time, values]: [string, any]) => ({
      time,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }));
    
    cache.set(cacheKey, data, 300); // Cache for 5 minutes
    
    return data;
  } catch (error) {
    console.error('[Alpha Vantage] Intraday error:', error);
    return [];
  }
}

// Export cache for testing/debugging
export { cache };
