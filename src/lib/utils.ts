// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function getSignalColor(signal: "buy" | "sell" | "hold"): string {
  switch (signal) {
    case "buy":
      return "buy";
    case "sell":
      return "sell";
    case "hold":
      return "hold";
    default:
      return "muted";
  }
}

export function getSignalBgColor(signal: "buy" | "sell" | "hold"): string {
  switch (signal) {
    case "buy":
      return "bg-buy/10 border-buy/30";
    case "sell":
      return "bg-sell/10 border-sell/30";
    case "hold":
      return "bg-hold/10 border-hold/30";
    default:
      return "bg-surface border-border";
  }
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return "Very High";
  if (confidence >= 60) return "High";
  if (confidence >= 40) return "Moderate";
  if (confidence >= 20) return "Low";
  return "Very Low";
}

export function calculateWinRate(history: { result?: "win" | "loss" | "pending" }[]): number {
  const completed = history.filter((h) => h.result === "win" || h.result === "loss");
  if (completed.length === 0) return 0;
  const wins = completed.filter((h) => h.result === "win").length;
  return Math.round((wins / completed.length) * 100);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
