// src/app/dashboard/alerts/page.tsx
"use client";

import { useState } from "react";
import { AlertItem } from "@/components/alerts/alert-item";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAlerts } from "@/lib/mock-data";
import { Bell, Check, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertFilter = "all" | "unread" | "signals" | "mentions";

export default function AlertsPage() {
  const [activeFilter, setActiveFilter] = useState<AlertFilter>("all");
  const [alerts, setAlerts] = useState(mockAlerts);

  const filters: { id: AlertFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "signals", label: "Signals" },
    { id: "mentions", label: "Mentions" },
  ];

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === "unread") return !alert.read;
    if (activeFilter === "signals") return alert.type === "signal_change";
    if (activeFilter === "mentions") return alert.type === "influencer_mention";
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          <p className="text-muted">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              activeFilter === filter.id
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:text-text"
            )}
          >
            {filter.label}
            {filter.id === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-sell text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">No alerts yet</h3>
          <p className="text-muted mb-4">
            We&apos;ll notify you when there are significant changes in your watchlist
          </p>
          <Button variant="secondary">Manage Alert Settings</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Today */}
          {filteredAlerts.some((a) => new Date(a.createdAt).getDate() === new Date().getDate()) && (
            <>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Today</h3>
              {filteredAlerts
                .filter((a) => new Date(a.createdAt).getDate() === new Date().getDate())
                .map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
            </>
          )}

          {/* Yesterday */}
          {filteredAlerts.some(
            (a) => new Date(a.createdAt).getDate() === new Date().getDate() - 1
          ) && (
            <>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mt-6">Yesterday</h3>
              {filteredAlerts
                .filter((a) => new Date(a.createdAt).getDate() === new Date().getDate() - 1)
                .map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
            </>
          )}

          {/* Older */}
          {filteredAlerts.some(
            (a) => new Date(a.createdAt).getDate() < new Date().getDate() - 1
          ) && (
            <>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mt-6">Earlier</h3>
              {filteredAlerts
                .filter((a) => new Date(a.createdAt).getDate() < new Date().getDate() - 1)
                .map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
            </>
          )}
        </div>
      )}

      {/* Alert Settings Preview */}
      <Card className="p-5 mt-8">
        <h3 className="font-semibold text-text mb-4">Alert Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-text">Signal Changes</p>
              <p className="text-xs text-muted">When a buy/sell/hold signal changes</p>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-text">Confidence Jumps</p>
              <p className="text-xs text-muted">When confidence changes by more than 20%</p>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-text">Viral Content</p>
              <p className="text-xs text-muted">When content goes viral (&gt;100K views)</p>
            </div>
            <div className="w-12 h-6 bg-surface-hover rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
