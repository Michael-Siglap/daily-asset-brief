"use client";
import type { PortfolioHolding, WatchlistItem } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface PortfolioContextValue {
  holdings: PortfolioHolding[];
  addHolding: (h: PortfolioHolding) => void;
  removeHolding: (symbol: string) => void;
  updateHolding: (symbol: string, updates: Partial<PortfolioHolding>) => void;
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);
const STORAGE_KEY = "dab_portfolio";
const WATCHLIST_KEY = "dab_watchlist";

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHoldings(JSON.parse(stored));
    } catch {}
    try {
      const storedWl = localStorage.getItem(WATCHLIST_KEY);
      if (storedWl) setWatchlist(JSON.parse(storedWl));
    } catch {}
  }, []);

  function persist(next: PortfolioHolding[]) {
    setHoldings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function persistWatchlist(next: WatchlistItem[]) {
    setWatchlist(next);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  }

  function addHolding(h: PortfolioHolding) {
    persist([...holdings.filter((x) => x.symbol !== h.symbol), h]);
  }

  function removeHolding(symbol: string) {
    persist(holdings.filter((h) => h.symbol !== symbol));
  }

  function updateHolding(symbol: string, updates: Partial<PortfolioHolding>) {
    persist(
      holdings.map((h) => (h.symbol === symbol ? { ...h, ...updates } : h)),
    );
  }

  function addToWatchlist(item: WatchlistItem) {
    if (watchlist.some((w) => w.symbol === item.symbol)) return;
    persistWatchlist([...watchlist, item]);
  }

  function removeFromWatchlist(symbol: string) {
    persistWatchlist(watchlist.filter((w) => w.symbol !== symbol));
  }

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        addHolding,
        removeHolding,
        updateHolding,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx)
    throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
