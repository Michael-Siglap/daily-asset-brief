"use client";
import { usePortfolio } from "@/context/PortfolioContext";
import { useToast } from "@/context/ToastContext";
import type { SearchResult } from "@/lib/types";
import { Plus, Search, Star, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm pt-14 md:pt-0 px-3 md:px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/60">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search symbol or company…"
            className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm outline-none"
            aria-label="Search assets"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden md:block text-xs bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] md:max-h-[50vh] overflow-y-auto">
          {searching && (
            <div className="py-8 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Searching…</p>
            </div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="py-10 text-center text-zinc-500 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {!searching && !query && (
            <div className="py-10 text-center">
              <Search className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">Type a ticker or company name</p>
              <p className="text-zinc-700 text-xs mt-1">e.g. AAPL, Bitcoin, S&amp;P 500</p>
            </div>
          )}
          {results.map((r) => {
            const inWatchlist = watchlistSet.has(r.symbol);
            const inPortfolio = holdingsSet.has(r.symbol);
            return (
              <div
                key={r.symbol}
                className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/50 transition-colors"
              >
                <button
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                  onClick={() => {
                    onViewFundamentals(r.symbol);
                    onClose();
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm">{r.symbol}</span>
                      <span className="text-zinc-600 text-xs bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                        {QUOTE_TYPE_LABEL[r.quoteType] ?? r.quoteType}
                      </span>
                      {r.exchange && (
                        <span className="text-zinc-600 text-xs shrink-0">{r.exchange}</span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs truncate mt-0.5">{r.name}</p>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      if (inWatchlist) {
                        removeFromWatchlist(r.symbol);
                        toast(`${r.symbol} removed from watchlist`, "info");
                      } else {
                        addToWatchlist({
                          symbol: r.symbol,
                          name: r.name,
                          category: categoryForType(r.quoteType),
                          addedAt: new Date().toISOString(),
                        });
                        toast(`${r.symbol} added to watchlist`, "success");
                      }
                    }}
                    title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      inWatchlist
                        ? "text-yellow-400 bg-yellow-400/10"
                        : "text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10"
                    }`}
                  >
                    <Star className="w-4 h-4" fill={inWatchlist ? "currentColor" : "none"} />
                  </button>

                  {!inPortfolio ? (
                    <button
                      onClick={() => {
                        addHolding({
                          symbol: r.symbol,
                          name: r.name,
                          quantity: 1,
                          purchasePrice: 0,
                          category: categoryForType(r.quoteType),
                        });
                        toast(`${r.symbol} added to portfolio`, "success");
                        onClose();
                      }}
                      title="Add to portfolio"
                      aria-label="Add to portfolio"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">
                      Owned
                    </span>
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
