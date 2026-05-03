"use client";
import { formatCurrency, formatPercent, colorForChange, bgColorForChange } from "@/lib/utils";
import type { QuoteData } from "@/lib/types";

interface Props {
  quote: QuoteData;
  onClick?: () => void;
  compact?: boolean;
}

const CATEGORY_ICON: Record<string, string> = {
  index: "📊",
  stock: "📈",
  crypto: "₿",
  commodity: "🏅",
};

export default function AssetCard({ quote, onClick, compact = false }: Props) {
  const changeColor = colorForChange(quote.changePercent);
  const bgColor = bgColorForChange(quote.changePercent);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border ${bgColor} hover:opacity-80 transition-opacity text-left`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{CATEGORY_ICON[quote.category] ?? "📈"}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{quote.symbol}</p>
            <p className="text-xs text-zinc-400 truncate">{quote.name}</p>
          </div>
        </div>
        <div className="text-right ml-2 shrink-0">
          <p className="font-mono font-semibold text-sm text-white">{formatCurrency(quote.price)}</p>
          <p className={`font-mono text-xs ${changeColor}`}>{formatPercent(quote.changePercent)}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border ${bgColor} p-4 hover:opacity-80 transition-opacity text-left`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span>{CATEGORY_ICON[quote.category] ?? "📈"}</span>
            <span className="font-bold text-white text-sm">{quote.symbol}</span>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5 truncate max-w-[120px]">{quote.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-white">{formatCurrency(quote.price)}</p>
          <p className={`font-mono text-sm font-semibold ${changeColor}`}>
            {formatPercent(quote.changePercent)}
          </p>
        </div>
      </div>
      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>H: {formatCurrency(quote.dayHigh)}</span>
        <span>L: {formatCurrency(quote.dayLow)}</span>
      </div>
    </button>
  );
}
