// src/types/index.ts

export type SignalType = "buy" | "sell" | "hold";

export interface StockSignal {
  id: string;
  ticker: string;
  name: string;
  signal: SignalType;
  confidence: number;
  price: number;
  change: number;
  changePercent: number;
  summary: string;
  lastUpdated: Date;
  sources: {
    youtube: number;
    twitter: number;
    reddit: number;
  };
  factors: SignalFactor[];
}

export interface SignalFactor {
  type: "positive" | "negative" | "neutral";
  label: string;
  value: string;
}

export interface SourceData {
  id: string;
  type: "youtube" | "twitter" | "reddit";
  title: string;
  author: string;
  url: string;
  sentiment: number;
  publishedAt: Date;
  engagement: number;
  snippet?: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  folder?: string;
  order: number;
  signal?: StockSignal;
  unreadAlerts?: number;
}

export interface WatchlistFolder {
  id: string;
  name: string;
  order: number;
  items: WatchlistItem[];
}

export interface Alert {
  id: string;
  type: "signal_change" | "confidence_jump" | "viral_content" | "influencer_mention" | "contrarian";
  ticker: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: {
    previousSignal?: SignalType;
    newSignal?: SignalType;
    confidenceChange?: number;
  };
}

export interface TrendingStock {
  rank: number;
  ticker: string;
  name: string;
  signal: SignalType;
  confidence: number;
  sentimentChange: number;
  mentionCount: number;
  mentionChange: number;
  reason: string;
}

export interface SignalHistory {
  id: string;
  ticker: string;
  signal: SignalType;
  confidence: number;
  priceAtSignal: number;
  priceAfter7Days?: number;
  result?: "win" | "loss" | "pending";
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  subscription: "free" | "pro" | "premium";
  preferences: UserPreferences;
}

export interface UserPreferences {
  darkMode: boolean;
  defaultView: "dashboard" | "whisper";
  pushNotifications: boolean;
  emailDigest: "never" | "daily" | "weekly";
  alertThreshold: number;
  whisperMode: boolean;
}

export interface BacktestResult {
  period: string;
  initialInvestment: number;
  finalValue: number;
  return: number;
  vsSP500: number;
  alpha: number;
  winRate: number;
  totalTrades: number;
  avgHoldDays: number;
  maxDrawdown: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  id: string;
  ticker: string;
  signal: SignalType;
  entryPrice: number;
  exitPrice?: number;
  entryDate: Date;
  exitDate?: Date;
  return?: number;
}
