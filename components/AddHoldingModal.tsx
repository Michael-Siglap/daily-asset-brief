"use client";
import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import type { PortfolioHolding } from "@/lib/types";

interface Props {
  onClose: () => void;
  existing?: PortfolioHolding;
}

const CATEGORY_OPTIONS = [
  { value: "stock", label: "Stock" },
  { value: "crypto", label: "Crypto" },
  { value: "commodity", label: "Commodity" },
  { value: "index", label: "Index / ETF" },
];

export default function AddHoldingModal({ onClose, existing }: Props) {
  const { addHolding } = usePortfolio();
  const [symbol, setSymbol] = useState(existing?.symbol ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() ?? "");
  const [purchasePrice, setPurchasePrice] = useState(existing?.purchasePrice?.toString() ?? "");
  const [purchaseDate, setPurchaseDate] = useState(existing?.purchaseDate ?? "");
  const [category, setCategory] = useState(existing?.category ?? "stock");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) { setError("Symbol is required"); return; }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) { setError("Enter a valid quantity"); return; }
    if (!purchasePrice || isNaN(Number(purchasePrice)) || Number(purchasePrice) <= 0) { setError("Enter a valid purchase price"); return; }

    addHolding({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim().toUpperCase(),
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      purchaseDate: purchaseDate || undefined,
      category,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">{existing ? "Edit Holding" : "Add Holding"}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Ticker Symbol *</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. AAPL"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 uppercase"
                disabled={!!existing}
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Name (optional)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple Inc."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    category === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Purchase Price (USD) *</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Purchase Date (optional)</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 transition-colors mt-2"
          >
            {existing ? "Update Holding" : "Add to Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
}
