"use client";
import AssetCard from "@/components/AssetCard";
import MarketStatus from "@/components/MarketStatus";
import { SkeletonCard, SkeletonNews, SkeletonRow } from "@/components/LoadingSkeleton";
import NewsCard from "@/components/NewsCard";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSettings } from "@/context/SettingsContext";
import { useUI } from "@/context/UIContext";
import { useNews, useQuotes } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import type { HoldingWithValue } from "@/lib/types";
import { colorForChange, formatCurrency, formatPercent } from "@/lib/utils";
import { RefreshCw, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { holdings } = usePortfolio();
  const { settings } = useSettings();
  const { openSearch, openFundamentals } = useUI();

  const allSymbols = useMemo(() => {
    const defaults = DEFAULT_WATCHLIST.map((d) => d.symbol);
    const portfolio = holdings.map((h) => h.symbol);
    return [...new Set([...defaults, ...portfolio])];
  }, [holdings]);

  const portfolioSymbols = holdings.map((h) => h.symbol);
  const {
    data: quotes,
    loading: quotesLoading,
    lastUpdated,
  } = useQuotes(allSymbols, settings.autoRefreshInterval);
  const { data: news, loading: newsLoading } = useNews(
    portfolioSymbols.length > 0
      ? portfolioSymbols
      : DEFAULT_WATCHLIST.slice(0, 5).map((d) => d.symbol),
    portfolioSymbols.length > 0 ? "portfolio" : "market",
  );

  const portfolioSummary = useMemo(() => {
    if (holdings.length === 0) return null;
    const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q]));
    const items: HoldingWithValue[] = holdings.map((h) => {
      const q = quoteMap[h.symbol];
      const currentPrice = q?.price ?? null;
      const currentValue = currentPrice != null ? currentPrice * h.quantity : null;
      const costBasis = h.purchasePrice * h.quantity;
      const pnl = currentValue != null ? currentValue - costBasis : null;
      const pnlPercent = pnl != null ? (pnl / costBasis) * 100 : null;
      return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPercent, changePercent: q?.changePercent ?? null };
    });
    const totalValue = items.reduce((s, h) => s + (h.currentValue ?? h.costBasis), 0);
    const totalCost = items.reduce((s, h) => s + h.costBasis, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = (totalPnl / totalCost) * 100;
    return { items, totalValue, totalCost, totalPnl, totalPnlPct };
  }, [holdings, quotes]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const indices = quotes.filter((q) => q.category === "index");
  const stocks = quotes.filter((q) => q.category === "stock");
  const crypto = quotes.filter((q) => q.category === "crypto");
  const commodities = quotes.filter((q) => q.category === "commodity");

  function timeAgo(date: Date) {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    return `${Math.floor(secs / 60)}m ago`;
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-8 pb-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-zinc-500 text-xs">{today}</p>
            <span className="md:hidden">
              <MarketStatus showLabel={false} />
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">Morning Brief</h1>
          {lastUpdated && (
            <p className="text-zinc-600 text-xs mt-0.5 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Updated {timeAgo(lastUpdated)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={openSearch}
            className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            title="Search assets (⌘K)"
            aria-label="Search assets"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/settings"
            className="md:hidden p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Summary */}
          {portfolioSummary && (
            <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-900/10 border border-blue-500/20 p-5">
              <p className="text-zinc-400 text-xs mb-1">Portfolio Value</p>
              <p className="text-white text-3xl font-bold font-mono">
                {formatCurrency(portfolioSummary.totalValue)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-semibold ${colorForChange(portfolioSummary.totalPnl)}`}>
                  {portfolioSummary.totalPnl >= 0 ? "+" : ""}
                  {formatCurrency(portfolioSummary.totalPnl)}
                </span>
                <span className={`text-sm ${colorForChange(portfolioSummary.totalPnlPct)}`}>
                  ({formatPercent(portfolioSummary.totalPnlPct)})
                </span>
                <span className="text-zinc-500 text-xs">all time</span>
              </div>
              <p className="text-zinc-600 text-xs mt-0.5">
                Cost basis {formatCurrency(portfolioSummary.totalCost)}
              </p>
              <div className="mt-4 space-y-2">
                {portfolioSummary.items.slice(0, 4).map((h) => (
                  <button
                    key={h.symbol}
                    onClick={() => openFundamentals(h.symbol)}
                    className="w-full flex justify-between items-center hover:bg-white/5 rounded-lg px-2 py-1 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">{h.symbol}</span>
                      <span className="text-zinc-500 text-xs">{h.quantity}×</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-sm font-mono">
                        {formatCurrency(h.currentValue ?? h.costBasis)}
                      </span>
                      {h.pnlPercent != null && (
                        <span className={`text-xs font-mono ml-2 ${colorForChange(h.pnlPercent)}`}>
                          {formatPercent(h.pnlPercent)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {portfolioSummary.items.length > 4 && (
                  <p className="text-zinc-600 text-xs text-center pt-1">
                    +{portfolioSummary.items.length - 4} more in Portfolio tab
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Indices */}
          {!quotesLoading && indices.length > 0 && (
            <section>
              <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Indices</h2>
              <div className="space-y-2">
                {indices.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => openFundamentals(q.symbol)} />
                ))}
              </div>
            </section>
          )}
          {quotesLoading && (
            <section>
              <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Indices</h2>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            </section>
          )}

          {/* Stocks */}
          <section>
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Stocks</h2>
            {quotesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {stocks.map((q) => (
                  <AssetCard key={q.symbol} quote={q} onClick={() => openFundamentals(q.symbol)} />
                ))}
              </div>
            )}
          </section>

          {/* Crypto */}
          {!quotesLoading && crypto.length > 0 && (
            <section>
              <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Crypto</h2>
              <div className="space-y-2">
                {crypto.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => openFundamentals(q.symbol)} />
                ))}
              </div>
            </section>
          )}

          {/* Commodities */}
          {!quotesLoading && commodities.length > 0 && (
            <section>
              <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Commodities</h2>
              <div className="space-y-2">
                {commodities.map((q) => (
                  <AssetCard key={q.symbol} quote={q} compact onClick={() => openFundamentals(q.symbol)} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column — news feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider">
              {holdings.length > 0 ? "Portfolio News" : "Top News"}
            </h2>
          </div>
          {newsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonNews key={i} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {news.slice(0, 8).map((item, i) => (
                <NewsCard key={i} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
