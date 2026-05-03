"use client";
import AssetCard from "@/components/AssetCard";
import FundamentalsPanel from "@/components/FundamentalsPanel";
import { SkeletonCard, SkeletonRow } from "@/components/LoadingSkeleton";
import SearchModal from "@/components/SearchModal";
import { useSettings } from "@/context/SettingsContext";
import { useMovers, useQuotes } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import { colorForChange, formatCurrency, formatPercent } from "@/lib/utils";
import { useState } from "react";

const TABS = ["Overview", "Gainers", "Losers"] as const;
type Tab = (typeof TABS)[number];

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const { settings } = useSettings();

  const allSymbols = DEFAULT_WATCHLIST.map((d) => d.symbol);
  const { data: quotes, loading: quotesLoading } = useQuotes(
    allSymbols,
    settings.autoRefreshInterval,
  );
  const { data: movers, loading: moversLoading } = useMovers();

  const indices = quotes.filter((q) => q.category === "index");
  const stocks = quotes.filter((q) => q.category === "stock");
  const crypto = quotes.filter((q) => q.category === "crypto");
  const commodities = quotes.filter((q) => q.category === "commodity");

  return (
    <div className="px-4 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white dark:text-white light:text-gray-900 text-2xl font-bold">
          Market 📊
        </h1>
        <button
          onClick={() => setShowSearch(true)}
          className="p-2 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
          title="Search assets"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-6 pb-6">
          {/* Indices */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
              Indices
            </h2>
            {quotesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {indices.map((q) => (
                  <AssetCard
                    key={q.symbol}
                    quote={q}
                    compact
                    onClick={() => setSelectedSymbol(q.symbol)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Stocks */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
              Large Cap Stocks
            </h2>
            {quotesLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {stocks.map((q) => (
                  <AssetCard
                    key={q.symbol}
                    quote={q}
                    onClick={() => setSelectedSymbol(q.symbol)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Crypto */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
              Cryptocurrency
            </h2>
            {quotesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {crypto.map((q) => (
                  <AssetCard
                    key={q.symbol}
                    quote={q}
                    compact
                    onClick={() => setSelectedSymbol(q.symbol)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Commodities */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
              Commodities
            </h2>
            {quotesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {commodities.map((q) => (
                  <AssetCard
                    key={q.symbol}
                    quote={q}
                    compact
                    onClick={() => setSelectedSymbol(q.symbol)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {(tab === "Gainers" || tab === "Losers") && (
        <div className="space-y-2 pb-6">
          {moversLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : (tab === "Gainers" ? movers.gainers : movers.losers).map(
                (item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">
                        {item.symbol}
                      </p>
                      <p className="text-zinc-500 text-xs truncate max-w-[160px]">
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono text-sm">
                        {formatCurrency(item.price)}
                      </p>
                      <p
                        className={`font-mono text-sm font-semibold ${colorForChange(item.changePercent)}`}
                      >
                        {formatPercent(item.changePercent)}
                      </p>
                    </div>
                  </button>
                ),
              )}
          {!moversLoading &&
            (tab === "Gainers" ? movers.gainers : movers.losers).length ===
              0 && (
              <p className="text-zinc-500 text-center py-8">
                No data available
              </p>
            )}
        </div>
      )}

      {selectedSymbol && (
        <FundamentalsPanel
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onViewFundamentals={(sym) => setSelectedSymbol(sym)}
        />
      )}
    </div>
  );
}
