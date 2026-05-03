"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import type { SearchResult } from "@/lib/types";

interface Props {
  onClose: () => void;
  onViewFundamentals: (symbol: string) => void;
}

const QUOTE_TYPE_LABEL: Record<string, string> = {
  EQUITY: "Stock",
  CRYPTOCURRENCY: "Crypto",
  ETF: "ETF",
  MUTUALFUND: "Fund",
  INDEX: "Index",
  FUTURE: "Future",
  CURRENCY: "FX",
};

export default function SearchModal({ onClose, onViewFundamentals }: Props) {
  const { holdings, addHolding, watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const watchlistSet = new Set(watchlist.map((w) => w.symbol));
  const holdingsSet = new Set(holdings.map((h) => h.symbol));

  function categoryForType(quoteType: string): string {
    const map: Record<string, string> = {
      EQUITY: "stock",
      CRYPTOCURRENCY: "crypto",
      ETF: "stock",
      INDEX: "index",
      FUTURE: "commodity",
    };
    return map[quoteType] ?? "stock";
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 dark:border-zinc-800 light:border-gray-200">
          <svg className="w-5 h-5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search symbol or company…"
            className="flex-1 bg-transparent text-white dark:text-white light:text-gray-900 placeholder-zinc-500 text-sm outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); }} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">×</button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {searching && (
            <div className="py-6 text-center text-zinc-500 text-sm">Searching…</div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="py-6 text-center text-zinc-500 text-sm">No results for "{query}"</div>
          )}
          {!searching && !query && (
            <div className="py-8 text-center text-zinc-600 text-sm">Type a ticker or company name</div>
          )}
          {results.map((r) => {
            const inWatchlist = watchlistSet.has(r.symbol);
            const inPortfolio = holdingsSet.has(r.symbol);
            return (
              <div
                key={r.symbol}
                className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 dark:border-zinc-800 light:border-gray-100 last:border-0 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-50 transition-colors"
              >
                {/* Info */}
                <button
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                  onClick={() => { onViewFundamentals(r.symbol); onClose(); }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white dark:text-white light:text-gray-900 font-bold text-sm">{r.symbol}</span>
                      <span className="text-zinc-600 text-xs bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                        {QUOTE_TYPE_LABEL[r.quoteType] ?? r.quoteType}
                      </span>
                      {r.exchange && <span className="text-zinc-600 text-xs shrink-0">{r.exchange}</span>}
                    </div>
                    <p className="text-zinc-400 text-xs truncate mt-0.5">{r.name}</p>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Watchlist toggle */}
                  <button
                    onClick={() => {
                      if (inWatchlist) {
                        removeFromWatchlist(r.symbol);
                      } else {
                        addToWatchlist({ symbol: r.symbol, name: r.name, category: categoryForType(r.quoteType), addedAt: new Date().toISOString() });
                      }
                    }}
                    title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    className={`p-1.5 rounded-lg transition-colors ${inWatchlist ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10"}`}
                  >
                    <svg className="w-4 h-4" fill={inWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>

                  {/* Add to portfolio */}
                  {!inPortfolio && (
                    <button
                      onClick={() => {
                        addHolding({ symbol: r.symbol, name: r.name, quantity: 1, purchasePrice: 0, category: categoryForType(r.quoteType) });
                        onClose();
                      }}
                      title="Add to portfolio"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  {inPortfolio && (
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">In portfolio</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
