"use client";
import { useState, useMemo } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useQuotes, useNews } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import { formatCurrency, formatPercent, colorForChange } from "@/lib/utils";
import AssetCard from "@/components/AssetCard";
import NewsCard from "@/components/NewsCard";
import FundamentalsPanel from "@/components/FundamentalsPanel";
import { SkeletonCard, SkeletonNews } from "@/components/LoadingSkeleton";
import type { HoldingWithValue } from "@/lib/types";

export default function DashboardPage() {
  const { holdings } = usePortfolio();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const allSymbols = useMemo(() => {
    const defaults = DEFAULT_WATCHLIST.map((d) => d.symbol);
    const portfolio = holdings.map((h) => h.symbol);
    return [...new Set([...defaults, ...portfolio])];
  }, [holdings]);

  const portfolioSymbols = holdings.map((h) => h.symbol);
  const { data: quotes, loading: quotesLoading } = useQuotes(allSymbols);
  const { data: news, loading: newsLoading } = useNews(
    portfolioSymbols.length > 0 ? portfolioSymbols : DEFAULT_WATCHLIST.slice(0, 5).map((d) => d.symbol),
    portfolioSymbols.length > 0 ? "portfolio" : "market"
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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const indices = quotes.filter((q) => q.category === "index");
  const stocks = quotes.filter((q) => q.category === "stock");
  const crypto = quotes.filter((q) => q.category === "crypto");
  const commodities = quotes.filter((q) => q.category === "commodity");

  return (
    <div className="px-4 pt-10 space-y-6">
      <div>
        <p className="text-zinc-500 text-xs">{today}</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">Morning Brief ⚡</h1>
      </div>

      {/* Portfolio Summary Card */}
      {portfolioSummary && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-900/10 border border-blue-500/20 p-5">
          <p className="text-zinc-400 text-xs mb-1">Portfolio Value</p>
          <p className="text-white text-3xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm font-semibold ${colorForChange(portfolioSummary.totalPnl)}`}>
              {portfolioSummary.totalPnl >= 0 ? "+" : ""}{formatCurrency(portfolioSummary.totalPnl)}
            </span>
            <span className={`text-sm ${colorForChange(portfolioSummary.totalPnlPct)}`}>
              ({formatPercent(portfolioSummary.totalPnlPct)})
            </span>
            <span className="text-zinc-500 text-xs">all time</span>
          </div>
          <p className="text-zinc-600 text-xs mt-0.5">Cost basis {formatCurrency(portfolioSummary.totalCost)}</p>
          <div className="mt-4 space-y-2">
            {portfolioSummary.items.slice(0, 4).map((h) => (
              <div key={h.symbol} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">{h.symbol}</span>
                  <span className="text-zinc-500 text-xs">{h.quantity}×</span>
                </div>
                <div className="text-right">
                  <span className="text-white text-sm">{formatCurrency(h.currentValue ?? h.costBasis)}</span>
                  {h.pnlPercent != null && (
                    <span className={`text-xs ml-2 ${colorForChange(h.pnlPercent)}`}>{formatPercent(h.pnlPercent)}</span>
                  )}
                </div>
              </div>
            ))}
            {portfolioSummary.items.length > 4 && (
              <p className="text-zinc-600 text-xs text-center pt-1">+{portfolioSummary.items.length - 4} more in Portfolio tab</p>
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
              <AssetCard key={q.symbol} quote={q} compact onClick={() => setSelectedSymbol(q.symbol)} />
            ))}
          </div>
        </section>
      )}

      {/* Stocks grid */}
      <section>
        <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Stocks</h2>
        {quotesLoading ? (
          <div className="grid grid-cols-2 gap-2">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {stocks.map((q) => (
              <AssetCard key={q.symbol} quote={q} onClick={() => setSelectedSymbol(q.symbol)} />
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
              <AssetCard key={q.symbol} quote={q} compact onClick={() => setSelectedSymbol(q.symbol)} />
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
              <AssetCard key={q.symbol} quote={q} compact onClick={() => setSelectedSymbol(q.symbol)} />
            ))}
          </div>
        </section>
      )}

      {/* News */}
      <section className="pb-4">
        <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
          {holdings.length > 0 ? "Portfolio News" : "Top News"}
        </h2>
        {newsLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonNews key={i} />)}</div>
        ) : (
          <div className="space-y-2">
            {news.slice(0, 6).map((item, i) => <NewsCard key={i} item={item} />)}
          </div>
        )}
      </section>

      {selectedSymbol && (
        <FundamentalsPanel symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} />
      )}
    </div>
  );
}
