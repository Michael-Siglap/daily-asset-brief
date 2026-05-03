"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { PortfolioHolding } from "@/lib/types";

interface PortfolioContextValue {
  holdings: PortfolioHolding[];
  addHolding: (h: PortfolioHolding) => void;
  removeHolding: (symbol: string) => void;
  updateHolding: (symbol: string, updates: Partial<PortfolioHolding>) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);
const STORAGE_KEY = "dab_portfolio";

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHoldings(JSON.parse(stored));
    } catch {}
  }, []);

  function persist(next: PortfolioHolding[]) {
    setHoldings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addHolding(h: PortfolioHolding) {
    persist([...holdings.filter((x) => x.symbol !== h.symbol), h]);
  }

  function removeHolding(symbol: string) {
    persist(holdings.filter((h) => h.symbol !== symbol));
  }

  function updateHolding(symbol: string, updates: Partial<PortfolioHolding>) {
    persist(holdings.map((h) => (h.symbol === symbol ? { ...h, ...updates } : h)));
  }

  return (
    <PortfolioContext.Provider value={{ holdings, addHolding, removeHolding, updateHolding }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
