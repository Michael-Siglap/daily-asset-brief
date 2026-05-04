"use client";
import PriceChart from "@/components/PriceChart";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { useFundamentals } from "@/hooks/useQuotes";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { Star, X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  symbol: string;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800/60 last:border-0">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className="text-white text-sm font-mono font-medium">{value}</span>
    </div>
  );
}

export default function FundamentalsPanel({ symbol, onClose }: Props) {
  const { data, loading } = useFundamentals(symbol);
  const { watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const { settings } = useSettings();
  const { toast } = useToast();
  const isDark = settings.theme !== "light";

  const inWatchlist = watchlist.some((w) => w.symbol === symbol);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function toggleWatchlist() {
    if (inWatchlist) {
      removeFromWatchlist(symbol);
      toast(`${symbol} removed from watchlist`, "info");
    } else {
      addToWatchlist({
        symbol,
        name: symbol,
        category: "stock",
        addedAt: new Date().toISOString(),
      });
      toast(`${symbol} added to watchlist`, "success");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-2xl bg-zinc-950 border border-zinc-800/60 rounded-t-2xl md:rounded-2xl max-h-[92vh] md:max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60 px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{symbol}</h2>
            {data?.sector && (
              <p className="text-zinc-400 text-xs mt-0.5">
                {data.sector}
                {data.industry ? ` · ${data.industry}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWatchlist}
              title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              className={`p-2 rounded-lg transition-colors ${
                inWatchlist
                  ? "text-yellow-400 bg-yellow-400/10"
                  : "text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10"
              }`}
            >
              <Star className="w-5 h-5" fill={inWatchlist ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="text-zinc-500 text-sm mt-3">Loading data…</p>
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-zinc-500">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm">No fundamental data available for {symbol}</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            {/* Chart */}
            <section>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Chart</h3>
              <PriceChart symbol={symbol} isDark={isDark} />
            </section>

            {/* Dividends */}
            {(data.dividendRate != null || data.dividendYield != null) && (
              <section>
                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Dividends</h3>
                {data.dividendRate != null && (
                  <Row label="Annual Dividend" value={`$${formatNumber(data.dividendRate)}`} />
                )}
                {data.dividendYield != null && (
                  <Row label="Dividend Yield" value={`${formatNumber(data.dividendYield)}%`} />
                )}
                {data.exDividendDate && (
                  <Row label="Ex-Dividend Date" value={data.exDividendDate} />
                )}
                {data.payoutRatio != null && (
                  <Row label="Payout Ratio" value={`${formatNumber(data.payoutRatio)}%`} />
                )}
              </section>
            )}

            {/* Valuation */}
            <section>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Valuation</h3>
              {data.peRatio != null && <Row label="P/E Ratio" value={formatNumber(data.peRatio)} />}
              {data.pbRatio != null && <Row label="Price / Book" value={formatNumber(data.pbRatio)} />}
              {data.epsTrailing != null && (
                <Row label="EPS (TTM)" value={formatCurrency(data.epsTrailing)} />
              )}
            </section>

            {/* Balance Sheet */}
            <section>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Balance Sheet</h3>
              {data.currentRatio != null && (
                <Row label="Assets / Liabilities" value={formatNumber(data.currentRatio)} />
              )}
              {data.debtToEquity != null && (
                <Row label="Debt / Equity" value={formatNumber(data.debtToEquity)} />
              )}
              {data.totalCash != null && (
                <Row label="Total Cash" value={formatCurrency(data.totalCash, true)} />
              )}
              {data.totalDebt != null && (
                <Row label="Total Debt" value={formatCurrency(data.totalDebt, true)} />
              )}
              {data.freeCashflow != null && (
                <Row label="Free Cash Flow" value={formatCurrency(data.freeCashflow, true)} />
              )}
            </section>

            {/* Performance */}
            <section>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Performance</h3>
              {data.profitMargins != null && (
                <Row label="Profit Margin" value={`${formatNumber(data.profitMargins)}%`} />
              )}
              {data.revenueGrowth != null && (
                <Row label="Revenue Growth" value={formatPercent(data.revenueGrowth)} />
              )}
              {data.returnOnEquity != null && (
                <Row label="Return on Equity" value={`${formatNumber(data.returnOnEquity)}%`} />
              )}
            </section>

            {/* About */}
            {data.description && (
              <section className="pb-2">
                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">About</h3>
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-6">{data.description}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
