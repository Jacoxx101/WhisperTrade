// src/components/signals/confidence-bar.tsx
import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBar({ value, size = "md", showLabel = true, className }: ConfidenceBarProps) {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-buy";
    if (val >= 60) return "bg-buy/70";
    if (val >= 40) return "bg-hold";
    if (val >= 20) return "bg-sell/70";
    return "bg-sell";
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const getLabel = (val: number) => {
    if (val >= 80) return "Very High";
    if (val >= 60) return "High";
    if (val >= 40) return "Moderate";
    if (val >= 20) return "Low";
    return "Very Low";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-muted">Confidence</span>
          <span className="font-medium text-text">{value}% — {getLabel(value)}</span>
        </div>
      )}
      <div className={cn("w-full bg-surface-hover rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
