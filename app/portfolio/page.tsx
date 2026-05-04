"use client";
import AddHoldingModal from "@/components/AddHoldingModal";
import AllocationChart from "@/components/AllocationChart";
import AssetCard from "@/components/AssetCard";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { useUI } from "@/context/UIContext";
import { useQuotes } from "@/hooks/useQuotes";
import type { HoldingWithValue } from "@/lib/types";
import { colorForChange, formatCurrency, formatPercent } from "@/lib/utils";
import { Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";

export default function PortfolioPage() {
  const { holdings, removeHolding, watchlist, removeFromWatchlist } = usePortfolio();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { openFundamentals } = useUI();
  const [tab, setTab] = useState<"holdings" | "watchlist">("holdings");
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, loading } = useQuotes(
    symbols.length > 0 ? symbols : undefined,
    settings.autoRefreshInterval,
  );

  const watchlistSymbols = watchlist.map((w) => w.symbol);
  const { data: watchlistQuotes, loading: wlLoading } = useQuotes(
    watchlistSymbols.length > 0 ? watchlistSymbols : undefined,
  );

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
    <div className="px-4 md:px-6 lg:px-8 pt-8 pb-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-white text-2xl font-bold">Portfolio</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-zinc-800/60 rounded-xl p-1 mb-5">
        {(["holdings", "watchlist"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize flex items-center justify-center gap-2 ${
              tab === t
                ? "bg-zinc-900 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "watchlist" && <Star className="w-3.5 h-3.5" />}
            {t}
            {t === "watchlist" && watchlist.length > 0 && (
              <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">
                {watchlist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* HOLDINGS TAB */}
      {tab === "holdings" && (
        <>
          {holdings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-zinc-300 font-semibold text-lg">No holdings yet</p>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
                Add stocks, crypto, or commodities to track your portfolio performance
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
              >
                Add your first holding
              </button>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl bg-zinc-900 border border-zinc-800/60 p-4">
                  <p className="text-zinc-500 text-xs mb-1">Total Value</p>
                  <p className="text-white text-lg font-bold font-mono">{formatCurrency(totalValue)}</p>
                </div>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800/60 p-4">
                  <p className="text-zinc-500 text-xs mb-1">All-time P&amp;L</p>
                  <p className={`text-lg font-bold font-mono ${colorForChange(totalPnl)}`}>
                    {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
                  </p>
                  <p className={`text-xs font-mono ${colorForChange(totalPnlPct)}`}>
                    {formatPercent(totalPnlPct)}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800/60 p-4">
                  <p className="text-zinc-500 text-xs mb-1">Cost Basis</p>
                  <p className="text-zinc-200 font-semibold font-mono">{formatCurrency(totalCost)}</p>
                </div>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800/60 p-4">
                  <p className="text-zinc-500 text-xs mb-1">Holdings</p>
                  <p className="text-zinc-200 font-semibold text-2xl">{holdings.length}</p>
                </div>
              </div>

              {/* Chart + Holdings side by side on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <AllocationChart holdings={enriched} />
                </div>

                <div className="lg:col-span-2 space-y-3">
                  {enriched.map((h) => (
                    <div
                      key={h.symbol}
                      className="rounded-xl bg-zinc-900 border border-zinc-800/60 overflow-hidden"
                    >
                      <button
                        className="w-full p-4 text-left hover:bg-zinc-800/40 transition-colors"
                        onClick={() => openFundamentals(h.symbol)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{h.symbol}</span>
                              <span className="text-zinc-500 text-xs capitalize bg-zinc-800 px-1.5 py-0.5 rounded">
                                {h.category}
                              </span>
                            </div>
                            <p className="text-zinc-500 text-xs mt-0.5">{h.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold font-mono">
                              {formatCurrency(h.currentValue ?? h.costBasis)}
                            </p>
                            {h.pnlPercent != null && (
                              <p className={`text-sm font-semibold font-mono ${colorForChange(h.pnlPercent)}`}>
                                {formatPercent(h.pnlPercent)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3 pt-3 border-t border-zinc-800/60">
                          {[
                            { label: "Qty", value: String(h.quantity) },
                            { label: "Avg Cost", value: formatCurrency(h.purchasePrice) },
                            { label: "Current", value: h.currentPrice ? formatCurrency(h.currentPrice) : "—" },
                            { label: "Cost Basis", value: formatCurrency(h.costBasis) },
                            {
                              label: "P&L $",
                              value: h.pnl != null ? `${h.pnl >= 0 ? "+" : ""}${formatCurrency(h.pnl)}` : "—",
                              color: colorForChange(h.pnl),
                            },
                            { label: "Today", value: h.changePercent != null ? formatPercent(h.changePercent) : "—", color: colorForChange(h.changePercent) },
                          ].map(({ label, value, color }) => (
                            <div key={label}>
                              <p className="text-zinc-600 text-xs">{label}</p>
                              <p className={`text-sm font-medium font-mono ${color ?? "text-zinc-300"}`}>{value}</p>
                            </div>
                          ))}
                        </div>
                        {h.purchaseDate && (
                          <p className="text-zinc-600 text-xs mt-2">Purchased {h.purchaseDate}</p>
                        )}
                      </button>

                      <div className="px-4 pb-3">
                        {confirmDelete === h.symbol ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                removeHolding(h.symbol);
                                toast(`${h.symbol} removed from portfolio`, "info");
                                setConfirmDelete(null);
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-medium"
                            >
                              Confirm Remove
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(h.symbol)}
                            className="w-full py-1.5 rounded-lg bg-zinc-800/60 text-zinc-500 text-xs font-medium hover:text-red-400 hover:bg-red-900/10 transition-colors"
                          >
                            Remove holding
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* WATCHLIST TAB */}
      {tab === "watchlist" && (
        <div className="pb-6">
          {watchlist.length === 0 ? (
            <div className="text-center py-20">
              <Star className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-300 font-semibold text-lg">Watchlist is empty</p>
              <p className="text-zinc-500 text-sm mt-2">
                Search for assets and tap the star icon to add them
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {watchlist.map((w) => {
                const q = watchlistQuotes.find((q) => q.symbol === w.symbol);
                return (
                  <div
                    key={w.symbol}
                    className="rounded-xl bg-zinc-900 border border-zinc-800/60 overflow-hidden"
                  >
                    {q ? (
                      <AssetCard quote={q} onClick={() => openFundamentals(w.symbol)} />
                    ) : (
                      <button
                        className="w-full p-4 text-left hover:bg-zinc-800/40 transition-colors"
                        onClick={() => openFundamentals(w.symbol)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold">{w.symbol}</p>
                            <p className="text-zinc-500 text-xs">{w.name}</p>
                          </div>
                          {wlLoading && (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
                          )}
                        </div>
                      </button>
                    )}
                    <div className="px-4 pb-3">
                      <button
                        onClick={() => {
                          removeFromWatchlist(w.symbol);
                          toast(`${w.symbol} removed from watchlist`, "info");
                        }}
                        className="w-full py-1.5 rounded-lg bg-zinc-800/60 text-zinc-500 text-xs font-medium hover:text-yellow-400 hover:bg-yellow-900/10 transition-colors"
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
    </div>
  );
}
