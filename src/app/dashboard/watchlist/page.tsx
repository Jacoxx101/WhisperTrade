// src/app/dashboard/watchlist/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/signals/signal-card";
import { mockWatchlist, mockSignals } from "@/lib/mock-data";
import { Search, Plus, Folder, MoreVertical, GripVertical } from "lucide-react";

interface FolderGroup {
  name: string;
  items: typeof mockWatchlist;
}

export default function WatchlistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["Tech Stocks", "Meme Stocks", "Crypto"]));
  
  // Group watchlist items by folder
  const folderGroups: FolderGroup[] = [
    { name: "Tech Stocks", items: mockWatchlist.filter((i) => i.folder === "Tech Stocks") },
    { name: "Meme Stocks", items: mockWatchlist.filter((i) => i.folder === "Meme Stocks") },
    { name: "Crypto", items: mockWatchlist.filter((i) => i.folder === "Crypto") },
  ];

  const toggleFolder = (name: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedFolders(newExpanded);
  };

  const getSignalForTicker = (ticker: string) => {
    return mockSignals.find((s) => s.ticker === ticker);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">My Watchlist</h1>
          <p className="text-muted">Track {mockWatchlist.length} stocks across {folderGroups.length} folders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="Search your watchlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-muted focus:outline-none focus:border-primary"
        />
      </div>

      {/* Folders */}
      <div className="space-y-4">
        {folderGroups.map((folder) => (
          <Card key={folder.name} className="overflow-hidden">
            {/* Folder Header */}
            <button
              onClick={() => toggleFolder(folder.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted cursor-grab" />
                <Folder className="w-5 h-5 text-primary" />
                <span className="font-semibold text-text">{folder.name}</span>
                <span className="text-sm text-muted">({folder.items.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </button>

            {/* Folder Content */}
            {expandedFolders.has(folder.name) && (
              <div className="border-t border-border">
                {folder.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted mb-4">No stocks in this folder</p>
                    <Button variant="secondary" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stock
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {folder.items.map((item) => {
                      const signal = getSignalForTicker(item.ticker);
                      if (!signal) return null;

                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-muted cursor-grab flex-shrink-0" />
                          <div className="flex-1">
                            <SignalCard signal={signal} variant="compact" />
                          </div>
                          {item.unreadAlerts && item.unreadAlerts > 0 && (
                            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                              {item.unreadAlerts}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Add Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text mb-4">Quick Add</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["MSFT", "GOOGL", "AMZN", "META"].map((ticker) => (
            <Button key={ticker} variant="secondary" className="justify-start">
              <Plus className="w-4 h-4 mr-2" />
              {ticker}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
