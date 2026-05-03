"use client";
import { useState } from "react";
import { useQuotes, useMovers } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import { formatCurrency, formatPercent, colorForChange } from "@/lib/utils";
import AssetCard from "@/components/AssetCard";
import FundamentalsPanel from "@/components/FundamentalsPanel";
import { SkeletonRow, SkeletonCard } from "@/components/LoadingSkeleton";

const TABS = ["Overview", "Gainers", "Losers"] as const;
type Tab = typeof TABS[number];

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const allSymbols = DEFAULT_WATCHLIST.map((d) => d.symbol);
  const { data: quotes, loading: quotesLoading } = useQuotes(allSymbols);
  const { data: movers, loading: moversLoading } = useMovers();

  const indices = quotes.filter((q) => q.category === "index");
  const stocks = quotes.filter((q) => q.category === "stock");
  const crypto = quotes.filter((q) => q.category === "crypto");
  const commodities = quotes.filter((q) => q.category === "commodity");

  return (
    <div className="px-4 pt-10">
      <h1 className="text-white text-2xl font-bold mb-6">Market 📊</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
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
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Indices</h2>
            {quotesLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : (
              <div className="space-y-2">
                {indices.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => setSelectedSymbol(q.symbol)} />
                ))}
              </div>
            )}
          </section>

          {/* Stocks */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Large Cap Stocks</h2>
            {quotesLoading ? (
              <div className="grid grid-cols-2 gap-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {stocks.map((q) => (
                  <AssetCard key={q.symbol} quote={q} onClick={() => setSelectedSymbol(q.symbol)} />
                ))}
              </div>
            )}
          </section>

          {/* Crypto */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Cryptocurrency</h2>
            {quotesLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : (
              <div className="space-y-2">
                {crypto.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => setSelectedSymbol(q.symbol)} />
                ))}
              </div>
            )}
          </section>

          {/* Commodities */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Commodities</h2>
            {quotesLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : (
              <div className="space-y-2">
                {commodities.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => setSelectedSymbol(q.symbol)} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {(tab === "Gainers" || tab === "Losers") && (
        <div className="space-y-2 pb-6">
          {moversLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : (
            (tab === "Gainers" ? movers.gainers : movers.losers).map((item) => (
              <button
                key={item.symbol}
                onClick={() => setSelectedSymbol(item.symbol)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
              >
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{item.symbol}</p>
                  <p className="text-zinc-500 text-xs truncate max-w-[160px]">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono text-sm">{formatCurrency(item.price)}</p>
                  <p className={`font-mono text-sm font-semibold ${colorForChange(item.changePercent)}`}>
                    {formatPercent(item.changePercent)}
                  </p>
                </div>
              </button>
            ))
          )}
          {!moversLoading && (tab === "Gainers" ? movers.gainers : movers.losers).length === 0 && (
            <p className="text-zinc-500 text-center py-8">No data available</p>
          )}
        </div>
      )}

      {selectedSymbol && (
        <FundamentalsPanel symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} />
      )}
    </div>
  );
}
