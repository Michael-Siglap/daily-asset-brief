"use client";
import { useFundamentals } from "@/hooks/useQuotes";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import PriceChart from "@/components/PriceChart";

interface Props {
  symbol: string;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800 dark:border-zinc-800 light:border-gray-100 last:border-0">
      <span className="text-zinc-400 dark:text-zinc-400 light:text-gray-500 text-sm">{label}</span>
      <span className="text-white dark:text-white light:text-gray-900 text-sm font-mono font-medium">{value}</span>
    </div>
  );
}

export default function FundamentalsPanel({ symbol, onClose }: Props) {
  const { data, loading } = useFundamentals(symbol);
  const { watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const { settings } = useSettings();
  const isDark = settings.theme !== "light";

  const inWatchlist = watchlist.some((w) => w.symbol === symbol);

  function toggleWatchlist() {
    if (inWatchlist) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist({
        symbol,
        name: data?.sector ? `${symbol}` : symbol,
        category: "stock",
        addedAt: new Date().toISOString(),
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-zinc-950 dark:bg-zinc-950 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-950 dark:bg-zinc-950 light:bg-white border-b border-zinc-800 dark:border-zinc-800 light:border-gray-200 px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white dark:text-white light:text-gray-900 font-bold text-lg">{symbol}</h2>
            {data?.sector && <p className="text-zinc-400 dark:text-zinc-400 light:text-gray-500 text-xs">{data.sector} · {data.industry}</p>}
          </div>
          <div className="flex items-center gap-2">
            {/* Watchlist toggle */}
            <button
              onClick={toggleWatchlist}
              title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              className={`p-2 rounded-lg transition-colors ${inWatchlist ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10"}`}
            >
              <svg className="w-5 h-5" fill={inWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button onClick={onClose} className="text-zinc-400 dark:text-zinc-400 light:text-gray-400 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading fundamentals…</div>
        ) : !data ? (
          <div className="p-8 text-center text-zinc-500">No data available</div>
        ) : (
          <div className="px-5 py-3">
            {/* Price Chart */}
            <section className="mb-4">
              <h3 className="text-zinc-500 dark:text-zinc-500 light:text-gray-400 text-xs uppercase tracking-wider mb-2">Chart</h3>
              <PriceChart symbol={symbol} isDark={isDark} />
            </section>

            {/* Dividends */}
            {(data.dividendRate != null || data.dividendYield != null) && (
              <section className="mb-4">
                <h3 className="text-zinc-500 dark:text-zinc-500 light:text-gray-400 text-xs uppercase tracking-wider mb-2">Dividends</h3>
                {data.dividendRate != null && <Row label="Annual Dividend" value={`$${formatNumber(data.dividendRate)}`} />}
                {data.dividendYield != null && <Row label="Dividend Yield" value={`${formatNumber(data.dividendYield)}%`} />}
                {data.exDividendDate && <Row label="Ex-Dividend Date" value={data.exDividendDate} />}
                {data.payoutRatio != null && <Row label="Payout Ratio" value={`${formatNumber(data.payoutRatio)}%`} />}
              </section>
            )}

            {/* Valuation */}
            <section className="mb-4">
              <h3 className="text-zinc-500 dark:text-zinc-500 light:text-gray-400 text-xs uppercase tracking-wider mb-2">Valuation</h3>
              {data.peRatio != null && <Row label="P/E Ratio" value={formatNumber(data.peRatio)} />}
              {data.pbRatio != null && <Row label="Price / Book" value={formatNumber(data.pbRatio)} />}
              {data.epsTrailing != null && <Row label="EPS (TTM)" value={formatCurrency(data.epsTrailing)} />}
            </section>

            {/* Balance Sheet */}
            <section className="mb-4">
              <h3 className="text-zinc-500 dark:text-zinc-500 light:text-gray-400 text-xs uppercase tracking-wider mb-2">Balance Sheet</h3>
              {data.currentRatio != null && <Row label="Assets / Liabilities" value={formatNumber(data.currentRatio)} />}
              {data.debtToEquity != null && <Row label="Debt / Equity" value={formatNumber(data.debtToEquity)} />}
              {data.totalCash != null && <Row label="Total Cash" value={formatCurrency(data.totalCash, true)} />}
              {data.totalDebt != null && <Row label="Total Debt" value={formatCurrency(data.totalDebt, true)} />}
              {data.freeCashflow != null && <Row label="Free Cash Flow" value={formatCurrency(data.freeCashflow, true)} />}
            </section>

            {/* Performance */}
            <section className="mb-4">
              <h3 className="text-zinc-500 dark:text-zinc-500 light:text-gray-400 text-xs uppercase tracking-wider mb-2">Performance</h3>
              {data.profitMargins != null && <Row label="Profit Margin" value={`${formatNumber(data.profitMargins)}%`} />}
              {data.revenueGrowth != null && <Row label="Revenue Growth" value={formatPercent(data.revenueGrowth)} />}
              {data.returnOnEquity != null && <Row label="Return on Equity" value={`${formatNumber(data.returnOnEquity)}%`} />}
            </section>

            {/* Description */}
            {data.description && (
              <section className="mb-4">
                <h3 className="text-zinc-500 dark:text-zinc-500 light:text-gray-400 text-xs uppercase tracking-wider mb-2">About</h3>
                <p className="text-zinc-400 dark:text-zinc-400 light:text-gray-600 text-xs leading-relaxed line-clamp-6">{data.description}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
