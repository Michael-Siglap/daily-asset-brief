"use client";
import AssetCard from "@/components/AssetCard";
import { SkeletonCard, SkeletonRow } from "@/components/LoadingSkeleton";
import { useSettings } from "@/context/SettingsContext";
import { useUI } from "@/context/UIContext";
import { useMovers, useQuotes } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import { colorForChange, formatCurrency, formatPercent } from "@/lib/utils";
import { Search, TrendingDown, TrendingUp } from "lucide-react";

const TABS = ["Overview", "Gainers", "Losers"] as const;
type Tab = (typeof TABS)[number];

import { useState } from "react";

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const { settings } = useSettings();
  const { openSearch, openFundamentals } = useUI();

  const allSymbols = DEFAULT_WATCHLIST.map((d) => d.symbol);
  const { data: quotes, loading: quotesLoading } = useQuotes(allSymbols, settings.autoRefreshInterval);
  const { data: movers, loading: moversLoading } = useMovers();

  const indices = quotes.filter((q) => q.category === "index");
  const stocks = quotes.filter((q) => q.category === "stock");
  const crypto = quotes.filter((q) => q.category === "crypto");
  const commodities = quotes.filter((q) => q.category === "commodity");

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-8 pb-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Market</h1>
        <button
          onClick={openSearch}
          className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Search assets (⌘K)"
          aria-label="Search assets"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "Gainers" && <TrendingUp className="w-3.5 h-3.5" />}
            {t === "Losers" && <TrendingDown className="w-3.5 h-3.5" />}
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-8 pb-6">
          {/* Indices */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Indices</h2>
            {quotesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {indices.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => openFundamentals(q.symbol)} />
                ))}
              </div>
            )}
          </section>

          {/* Stocks */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Large Cap Stocks</h2>
            {quotesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {stocks.map((q) => (
                  <AssetCard key={q.symbol} quote={q} onClick={() => openFundamentals(q.symbol)} />
                ))}
              </div>
            )}
          </section>

          {/* Crypto & Commodities side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Cryptocurrency</h2>
              {quotesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {crypto.map((q) => (
                    <AssetCard key={q.symbol} quote={q} compact onClick={() => openFundamentals(q.symbol)} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Commodities</h2>
              {quotesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {commodities.map((q) => (
                    <AssetCard key={q.symbol} quote={q} compact onClick={() => openFundamentals(q.symbol)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {(tab === "Gainers" || tab === "Losers") && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            {tab === "Gainers" ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <p className="text-zinc-400 text-xs uppercase tracking-wider">
              Top {tab === "Gainers" ? "Gainers" : "Losers"} Today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-6">
            {moversLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : (tab === "Gainers" ? movers.gainers : movers.losers).map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => openFundamentals(item.symbol)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800/60 hover:bg-zinc-800/60 transition-colors text-left"
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{item.symbol}</p>
                      <p className="text-zinc-500 text-xs truncate max-w-[180px]">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono text-sm">{formatCurrency(item.price)}</p>
                      <p className={`font-mono text-sm font-semibold ${colorForChange(item.changePercent)}`}>
                        {formatPercent(item.changePercent)}
                      </p>
                    </div>
                  </button>
                ))}
          </div>
          {!moversLoading && (tab === "Gainers" ? movers.gainers : movers.losers).length === 0 && (
            <p className="text-zinc-500 text-center py-12">No data available</p>
          )}
        </div>
      )}
    </div>
  );
}
