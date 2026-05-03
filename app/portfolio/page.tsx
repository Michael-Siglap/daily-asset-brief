"use client";
import { useState, useMemo } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useQuotes } from "@/hooks/useQuotes";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency, formatPercent, colorForChange } from "@/lib/utils";
import AddHoldingModal from "@/components/AddHoldingModal";
import FundamentalsPanel from "@/components/FundamentalsPanel";
import AllocationChart from "@/components/AllocationChart";
import AssetCard from "@/components/AssetCard";
import type { HoldingWithValue } from "@/lib/types";

export default function PortfolioPage() {
  const { holdings, removeHolding, watchlist, removeFromWatchlist } = usePortfolio();
  const { settings } = useSettings();
  const [tab, setTab] = useState<"holdings" | "watchlist">("holdings");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, loading } = useQuotes(symbols.length > 0 ? symbols : undefined, settings.autoRefreshInterval);

  const watchlistSymbols = watchlist.map((w) => w.symbol);
  const { data: watchlistQuotes, loading: wlLoading } = useQuotes(watchlistSymbols.length > 0 ? watchlistSymbols : undefined);

  const enriched = useMemo((): HoldingWithValue[] => {
    const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q]));
    return holdings.map((h) => {
      const q = quoteMap[h.symbol];
      const currentPrice = q?.price ?? null;
      const currentValue = currentPrice != null ? currentPrice * h.quantity : null;
      const costBasis = h.purchasePrice * h.quantity;
      const pnl = currentValue != null ? currentValue - costBasis : null;
      const pnlPercent = pnl != null ? (pnl / costBasis) * 100 : null;
      return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPercent, changePercent: q?.changePercent ?? null };
    });
  }, [holdings, quotes]);

  const totalValue = enriched.reduce((s, h) => s + (h.currentValue ?? h.costBasis), 0);
  const totalCost = enriched.reduce((s, h) => s + h.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="px-4 pt-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-white dark:text-white light:text-gray-900 text-2xl font-bold">Portfolio 💼</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 rounded-xl p-1 mb-4">
        {(["holdings", "watchlist"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-zinc-900 dark:bg-zinc-900 light:bg-white text-white dark:text-white light:text-gray-900 shadow"
                : "text-zinc-400 dark:text-zinc-400 light:text-gray-500"
            }`}
          >
            {t}
            {t === "watchlist" && watchlist.length > 0 && (
              <span className="ml-1.5 text-xs bg-zinc-700 dark:bg-zinc-700 light:bg-gray-200 text-zinc-400 dark:text-zinc-400 light:text-gray-500 px-1.5 py-0.5 rounded-full">{watchlist.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* HOLDINGS TAB */}
      {tab === "holdings" && (
        <>
          {holdings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-zinc-400 font-medium">No holdings yet</p>
              <p className="text-zinc-600 text-sm mt-1">Add stocks, crypto, or commodities to track your portfolio</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
              >
                Add your first holding
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 p-5 mb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-500 text-xs mb-0.5">Total Value</p>
                    <p className="text-white dark:text-white light:text-gray-900 text-xl font-bold">{formatCurrency(totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-0.5">All-time P&L</p>
                    <p className={`text-xl font-bold ${colorForChange(totalPnl)}`}>
                      {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
                    </p>
                    <p className={`text-xs ${colorForChange(totalPnlPct)}`}>{formatPercent(totalPnlPct)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-0.5">Cost Basis</p>
                    <p className="text-zinc-300 dark:text-zinc-300 light:text-gray-600 font-semibold">{formatCurrency(totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-0.5">Holdings</p>
                    <p className="text-zinc-300 dark:text-zinc-300 light:text-gray-600 font-semibold">{holdings.length}</p>
                  </div>
                </div>
              </div>

              {/* Allocation Chart */}
              <AllocationChart holdings={enriched} />

              {/* Holdings list */}
              <div className="space-y-3 pb-6">
                {enriched.map((h) => (
                  <div key={h.symbol} className="rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 overflow-hidden">
                    <button
                      className="w-full p-4 text-left hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedSymbol(h.symbol)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white dark:text-white light:text-gray-900 font-bold">{h.symbol}</span>
                            <span className="text-zinc-500 text-xs capitalize bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 px-1.5 py-0.5 rounded">{h.category}</span>
                          </div>
                          <p className="text-zinc-500 text-xs mt-0.5">{h.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white dark:text-white light:text-gray-900 font-bold">{formatCurrency(h.currentValue ?? h.costBasis)}</p>
                          {h.pnlPercent != null && (
                            <p className={`text-sm font-semibold ${colorForChange(h.pnlPercent)}`}>
                              {formatPercent(h.pnlPercent)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800 dark:border-zinc-800 light:border-gray-100">
                        <div>
                          <p className="text-zinc-600 text-xs">Qty</p>
                          <p className="text-zinc-300 dark:text-zinc-300 light:text-gray-600 text-sm font-medium">{h.quantity}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs">Avg Cost</p>
                          <p className="text-zinc-300 dark:text-zinc-300 light:text-gray-600 text-sm font-medium">{formatCurrency(h.purchasePrice)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs">Current</p>
                          <p className={`text-sm font-medium ${h.currentPrice ? "text-zinc-300 dark:text-zinc-300 light:text-gray-600" : "text-zinc-600"}`}>
                            {h.currentPrice ? formatCurrency(h.currentPrice) : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs">Cost Basis</p>
                          <p className="text-zinc-300 dark:text-zinc-300 light:text-gray-600 text-sm font-medium">{formatCurrency(h.costBasis)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs">P&L $</p>
                          <p className={`text-sm font-medium ${colorForChange(h.pnl)}`}>
                            {h.pnl != null ? `${h.pnl >= 0 ? "+" : ""}${formatCurrency(h.pnl)}` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs">Today</p>
                          <p className={`text-sm font-medium ${colorForChange(h.changePercent)}`}>
                            {h.changePercent != null ? formatPercent(h.changePercent) : "—"}
                          </p>
                        </div>
                      </div>
                      {h.purchaseDate && (
                        <p className="text-zinc-600 text-xs mt-2">Purchased {h.purchaseDate}</p>
                      )}
                    </button>

                    {/* Delete */}
                    <div className="px-4 pb-3">
                      {confirmDelete === h.symbol ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { removeHolding(h.symbol); setConfirmDelete(null); }}
                            className="flex-1 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-medium"
                          >
                            Confirm Remove
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 text-zinc-400 text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(h.symbol)}
                          className="w-full py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 text-zinc-500 text-xs font-medium hover:text-red-400 transition-colors"
                        >
                          Remove holding
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* WATCHLIST TAB */}
      {tab === "watchlist" && (
        <div className="pb-6">
          {watchlist.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">⭐</p>
              <p className="text-zinc-400 font-medium">Your watchlist is empty</p>
              <p className="text-zinc-600 text-sm mt-1">Search for assets and tap the star icon to add them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((w) => {
                const q = watchlistQuotes.find((q) => q.symbol === w.symbol);
                return (
                  <div key={w.symbol} className="rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 overflow-hidden">
                    {q ? (
                      <AssetCard
                        quote={q}
                        onClick={() => setSelectedSymbol(w.symbol)}
                      />
                    ) : (
                      <button
                        className="w-full p-4 text-left hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedSymbol(w.symbol)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white dark:text-white light:text-gray-900 font-bold">{w.symbol}</p>
                            <p className="text-zinc-500 text-xs">{w.name}</p>
                          </div>
                          {wlLoading && <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />}
                        </div>
                      </button>
                    )}
                    <div className="px-4 pb-3">
                      <button
                        onClick={() => removeFromWatchlist(w.symbol)}
                        className="w-full py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 text-zinc-500 text-xs font-medium hover:text-yellow-400 transition-colors"
                      >
                        Remove from watchlist
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAdd && <AddHoldingModal onClose={() => setShowAdd(false)} />}
      {selectedSymbol && <FundamentalsPanel symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} />}
    </div>
  );
}
