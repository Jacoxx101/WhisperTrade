// src/components/signals/signal-badge.tsx
import { SignalType } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SignalBadgeProps {
  signal: SignalType;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  className?: string;
}

export function SignalBadge({ signal, size = "md", showIcon = true, className }: SignalBadgeProps) {
  const config = {
    buy: {
      bg: "bg-buy/10",
      border: "border-buy/30",
      text: "text-buy",
      icon: TrendingUp,
      label: "BUY",
    },
    sell: {
      bg: "bg-sell/10",
      border: "border-sell/30",
      text: "text-sell",
      icon: TrendingDown,
      label: "SELL",
    },
    hold: {
      bg: "bg-hold/10",
      border: "border-hold/30",
      text: "text-hold",
      icon: Minus,
      label: "HOLD",
    },
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
    xl: "px-6 py-2 text-2xl",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 24,
  };

  const { bg, border, text, icon: Icon, label } = config[signal];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-lg border",
        bg,
        border,
        text,
        sizes[size],
        className
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {label}
    </span>
  );
}
