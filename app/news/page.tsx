"use client";
import { SkeletonNews } from "@/components/LoadingSkeleton";
import NewsCard from "@/components/NewsCard";
import { usePortfolio } from "@/context/PortfolioContext";
import { useUI } from "@/context/UIContext";
import { useNews, useQuotes } from "@/hooks/useQuotes";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";
import { Briefcase, Globe } from "lucide-react";
import { useState } from "react";

type Mode = "portfolio" | "market";

export default function NewsPage() {
  const { holdings } = usePortfolio();
  const { openFundamentals } = useUI();
  const [mode, setMode] = useState<Mode>(holdings.length > 0 ? "portfolio" : "market");

  const portfolioSymbols = holdings.map((h) => h.symbol);
  const { data: news, loading } = useNews(mode === "portfolio" ? portfolioSymbols : [], mode);

  const dividendSymbols = [
    "AAPL", "MSFT", "JNJ", "KO", "XOM", "JPM",
    ...portfolioSymbols,
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);
  const { data: divQuotes } = useQuotes(dividendSymbols);

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-8 pb-4 max-w-6xl mx-auto">
      <h1 className="text-white text-2xl font-bold mb-5">News</h1>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode("portfolio")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mode === "portfolio" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Portfolio
        </button>
        <button
          onClick={() => setMode("market")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mode === "market" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Globe className="w-4 h-4" />
          Market-wide
        </button>
      </div>

      {/* Empty portfolio hint */}
      {mode === "portfolio" && holdings.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 mb-6 text-center">
          <p className="text-zinc-400 text-sm">Add holdings in the Portfolio tab to see personalised news.</p>
          <p className="text-zinc-600 text-xs mt-1">Showing broad market news instead.</p>
        </div>
      )}

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main news feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-zinc-400 text-xs uppercase tracking-wider">
              {mode === "portfolio" ? "Portfolio News" : "Top Market News"}
              {!loading && (
                <span className="ml-2 text-zinc-600">({news.length})</span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonNews key={i} />)}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No news found</p>
              <p className="text-zinc-600 text-xs mt-1">Try switching to market-wide mode</p>
            </div>
          ) : (
            <div className="space-y-2">
              {news.map((item, i) => <NewsCard key={i} item={item} />)}
            </div>
          )}
        </div>

        {/* Sidebar: dividend stocks */}
        <div>
          <h2 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
            Dividend Stocks
          </h2>
          <p className="text-zinc-600 text-xs mb-3">Tap for fundamentals & dividend details</p>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {divQuotes.map((q) => (
              <button
                key={q.symbol}
                onClick={() => openFundamentals(q.symbol)}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800/60 rounded-xl p-3 hover:bg-zinc-800/60 transition-colors text-left"
              >
                <div>
                  <span className="text-white font-bold text-sm">{q.symbol}</span>
                  <p className="text-zinc-500 text-xs truncate max-w-[100px]">{q.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-zinc-300 text-sm font-mono">
                    {q.price != null ? `$${q.price.toFixed(2)}` : "—"}
                  </span>
                  <p
                    className={`text-xs font-mono ${
                      q.changePercent != null && q.changePercent > 0
                        ? "text-emerald-400"
                        : q.changePercent != null && q.changePercent < 0
                        ? "text-red-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {q.changePercent != null
                      ? `${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
