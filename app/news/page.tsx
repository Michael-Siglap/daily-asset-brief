"use client";
import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNews, useQuotes } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import NewsCard from "@/components/NewsCard";
import FundamentalsPanel from "@/components/FundamentalsPanel";
import AssetCard from "@/components/AssetCard";
import { SkeletonNews } from "@/components/LoadingSkeleton";

type Mode = "portfolio" | "market";

export default function NewsPage() {
  const { holdings } = usePortfolio();
  const [mode, setMode] = useState<Mode>(holdings.length > 0 ? "portfolio" : "market");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const portfolioSymbols = holdings.map((h) => h.symbol);
  const { data: news, loading } = useNews(
    mode === "portfolio" ? portfolioSymbols : [],
    mode
  );

  // Dividend-related assets (stocks with dividends) for the highlights strip
  const dividendSymbols = ["AAPL", "MSFT", "JNJ", "KO", "XOM", "JPM", ...portfolioSymbols].filter(
    (v, i, a) => a.indexOf(v) === i
  ).slice(0, 6);
  const { data: divQuotes } = useQuotes(dividendSymbols);

  return (
    <div className="px-4 pt-10">
      <h1 className="text-white text-2xl font-bold mb-4">News 📰</h1>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-5">
        <button
          onClick={() => setMode("portfolio")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mode === "portfolio" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          💼 My Portfolio
        </button>
        <button
          onClick={() => setMode("market")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mode === "market" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          🌍 Market-wide
        </button>
      </div>

      {/* No portfolio warning */}
      {mode === "portfolio" && holdings.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-5 text-center">
          <p className="text-zinc-400 text-sm">Add holdings in the Portfolio tab to see personalised news.</p>
          <p className="text-zinc-600 text-xs mt-1">Showing broad market news instead.</p>
        </div>
      )}

      {/* Key assets for dividend context */}
      <section className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-zinc-400 text-xs uppercase tracking-wider">Dividend Stocks — Tap for details</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {divQuotes.map((q) => (
            <button
              key={q.symbol}
              onClick={() => setSelectedSymbol(q.symbol)}
              className="flex-shrink-0 flex flex-col items-start bg-zinc-900 border border-zinc-800 rounded-xl p-3 min-w-[100px] hover:bg-zinc-800 transition-colors"
            >
              <span className="text-white font-bold text-sm">{q.symbol}</span>
              <span className="text-zinc-400 text-xs font-mono">{q.price != null ? `$${q.price.toFixed(2)}` : "—"}</span>
              <span className={`text-xs font-mono mt-0.5 ${q.changePercent != null && q.changePercent > 0 ? "text-emerald-400" : q.changePercent != null && q.changePercent < 0 ? "text-red-400" : "text-zinc-500"}`}>
                {q.changePercent != null ? `${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%` : "—"}
              </span>
            </button>
          ))}
        </div>
        <p className="text-zinc-600 text-xs mt-2">Tap any ticker to see dividend yield, ex-date, payout ratio & more</p>
      </section>

      {/* News feed */}
      <section className="pb-6">
        <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
          {mode === "portfolio" ? "Portfolio News" : "Top Market News"}
          {!loading && <span className="ml-2 text-zinc-600">({news.length})</span>}
        </h2>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <SkeletonNews key={i} />)}</div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No news found</p>
            <p className="text-zinc-600 text-xs mt-1">Try switching to market-wide mode</p>
          </div>
        ) : (
          <div className="space-y-2">
            {news.map((item, i) => <NewsCard key={i} item={item} />)}
          </div>
        )}
      </section>

      {selectedSymbol && (
        <FundamentalsPanel symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} />
      )}
    </div>
  );
}
