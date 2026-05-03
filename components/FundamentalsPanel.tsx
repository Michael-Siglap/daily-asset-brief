"use client";
import { useFundamentals } from "@/hooks/useQuotes";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface Props {
  symbol: string;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className="text-white text-sm font-mono font-medium">{value}</span>
    </div>
  );
}

export default function FundamentalsPanel({ symbol, onClose }: Props) {
  const { data, loading } = useFundamentals(symbol);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">{symbol}</h2>
            {data?.sector && <p className="text-zinc-400 text-xs">{data.sector} · {data.industry}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading fundamentals…</div>
        ) : !data ? (
          <div className="p-8 text-center text-zinc-500">No data available</div>
        ) : (
          <div className="px-5 py-3">
            {/* Dividends */}
            {(data.dividendRate != null || data.dividendYield != null) && (
              <section className="mb-4">
                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Dividends</h3>
                {data.dividendRate != null && <Row label="Annual Dividend" value={`$${formatNumber(data.dividendRate)}`} />}
                {data.dividendYield != null && <Row label="Dividend Yield" value={`${formatNumber(data.dividendYield)}%`} />}
                {data.exDividendDate && <Row label="Ex-Dividend Date" value={data.exDividendDate} />}
                {data.payoutRatio != null && <Row label="Payout Ratio" value={`${formatNumber(data.payoutRatio)}%`} />}
              </section>
            )}

            {/* Valuation */}
            <section className="mb-4">
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Valuation</h3>
              {data.peRatio != null && <Row label="P/E Ratio" value={formatNumber(data.peRatio)} />}
              {data.pbRatio != null && <Row label="Price / Book" value={formatNumber(data.pbRatio)} />}
              {data.epsTrailing != null && <Row label="EPS (TTM)" value={formatCurrency(data.epsTrailing)} />}
            </section>

            {/* Balance Sheet */}
            <section className="mb-4">
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Balance Sheet</h3>
              {data.currentRatio != null && <Row label="Assets / Liabilities" value={formatNumber(data.currentRatio)} />}
              {data.debtToEquity != null && <Row label="Debt / Equity" value={formatNumber(data.debtToEquity)} />}
              {data.totalCash != null && <Row label="Total Cash" value={formatCurrency(data.totalCash, true)} />}
              {data.totalDebt != null && <Row label="Total Debt" value={formatCurrency(data.totalDebt, true)} />}
              {data.freeCashflow != null && <Row label="Free Cash Flow" value={formatCurrency(data.freeCashflow, true)} />}
            </section>

            {/* Performance */}
            <section className="mb-4">
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Performance</h3>
              {data.profitMargins != null && <Row label="Profit Margin" value={`${formatNumber(data.profitMargins)}%`} />}
              {data.revenueGrowth != null && <Row label="Revenue Growth" value={formatPercent(data.revenueGrowth)} />}
              {data.returnOnEquity != null && <Row label="Return on Equity" value={`${formatNumber(data.returnOnEquity)}%`} />}
            </section>

            {/* Description */}
            {data.description && (
              <section className="mb-4">
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
