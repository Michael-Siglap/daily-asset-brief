"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UIContextValue {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  activeSymbol: string | null;
  openFundamentals: (symbol: string) => void;
  closeFundamentals: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openFundamentals = useCallback((symbol: string) => setActiveSymbol(symbol), []);
  const closeFundamentals = useCallback(() => setActiveSymbol(null), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <UIContext.Provider value={{ searchOpen, openSearch, closeSearch, activeSymbol, openFundamentals, closeFundamentals }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
