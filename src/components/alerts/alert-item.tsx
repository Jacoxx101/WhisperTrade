// src/components/alerts/alert-item.tsx
"use client";

import { Alert } from "@/types";
import { Card } from "@/components/ui/card";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Bell, TrendingUp, TrendingDown, Zap, MessageCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface AlertItemProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
}

export function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const config = {
    signal_change: {
      icon: alert.data?.newSignal === "buy" ? TrendingUp : alert.data?.newSignal === "sell" ? TrendingDown : Bell,
      bg: alert.data?.newSignal === "buy" ? "bg-buy/10" : alert.data?.newSignal === "sell" ? "bg-sell/10" : "bg-hold/10",
      border: alert.data?.newSignal === "buy" ? "border-buy/30" : alert.data?.newSignal === "sell" ? "border-sell/30" : "border-hold/30",
      text: alert.data?.newSignal === "buy" ? "text-buy" : alert.data?.newSignal === "sell" ? "text-sell" : "text-hold",
    },
    confidence_jump: {
      icon: Zap,
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
    },
    viral_content: {
      icon: Zap,
      bg: "bg-hold/10",
      border: "border-hold/30",
      text: "text-hold",
    },
    influencer_mention: {
      icon: MessageCircle,
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
    },
    contrarian: {
      icon: AlertTriangle,
      bg: "bg-sell/10",
      border: "border-sell/30",
      text: "text-sell",
    },
  };

  const style = config[alert.type];

  return (
    <Card className={cn("p-4 transition-colors", !alert.read && "bg-surface-hover/50")}>
      <Link href={`/dashboard/stock/${alert.ticker}`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border", style.bg, style.border)}>
            <style.icon className={cn("w-5 h-5", style.text)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={cn("font-semibold text-sm", !alert.read && "text-text")}>
                  {alert.title}
                </h4>
                <p className="text-sm text-muted mt-0.5">{alert.message}</p>
              </div>
              <span className="text-xs text-muted whitespace-nowrap">{formatTimeAgo(alert.createdAt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-primary font-medium">View Details</span>
              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDismiss(alert.id);
                  }}
                  className="text-xs text-muted hover:text-text"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>

          {/* Unread Indicator */}
          {!alert.read && (
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
          )}
        </div>
      </Link>
    </Card>
  );
}
