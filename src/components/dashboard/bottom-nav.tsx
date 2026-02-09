// src/components/dashboard/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, List, TrendingUp, Bell, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: List },
  { href: "/dashboard/trending", label: "Trending", icon: TrendingUp },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface BottomNavProps {
  unreadAlerts?: number;
}

export function BottomNav({ unreadAlerts = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.href === "/dashboard/alerts" && unreadAlerts > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted hover:text-text"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sell text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadAlerts > 9 ? "9+" : unreadAlerts}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
