"use client";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSettings } from "@/context/SettingsContext";
import Link from "next/link";
import { useState } from "react";

const THEME_OPTIONS = [
  { value: "dark" as const, label: "Dark" },
  { value: "light" as const, label: "Light" },
  { value: "system" as const, label: "System" },
];

const REFRESH_OPTIONS = [
  { value: 0 as const, label: "Off" },
  { value: 30000 as const, label: "30s" },
  { value: 60000 as const, label: "1 min" },
  { value: 300000 as const, label: "5 min" },
];

const CURRENCY_OPTIONS = [
  { value: "USD" as const, label: "USD $" },
  { value: "EUR" as const, label: "EUR €" },
  { value: "GBP" as const, label: "GBP £" },
  { value: "JPY" as const, label: "JPY ¥" },
];

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-zinc-900 dark:bg-zinc-900 light:bg-white text-white dark:text-white light:text-gray-900 shadow"
              : "text-zinc-400 dark:text-zinc-400 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, setTheme, setAutoRefreshInterval, setCurrency } =
    useSettings();
  const { holdings, watchlist } = usePortfolio();
  const [confirmClear, setConfirmClear] = useState<
    "portfolio" | "watchlist" | null
  >(null);

  function clearPortfolio() {
    localStorage.setItem("dab_portfolio", "[]");
    window.location.reload();
  }

  function clearWatchlist() {
    localStorage.setItem("dab_watchlist", "[]");
    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-zinc-950 dark:bg-zinc-950 light:bg-gray-50 pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-white dark:text-white light:text-gray-900 text-xl font-bold">
          Settings
        </h1>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <section className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-2xl p-4">
          <h2 className="text-zinc-400 dark:text-zinc-400 light:text-gray-500 text-xs uppercase tracking-wider mb-3">
            Appearance
          </h2>
          <div className="space-y-1 mb-3">
            <span className="text-white dark:text-white light:text-gray-900 text-sm">
              Theme
            </span>
          </div>
          <SegmentedControl
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={setTheme}
          />
        </section>

        {/* Auto Refresh */}
        <section className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-2xl p-4">
          <h2 className="text-zinc-400 dark:text-zinc-400 light:text-gray-500 text-xs uppercase tracking-wider mb-3">
            Data
          </h2>
          <div className="mb-3">
            <span className="text-white dark:text-white light:text-gray-900 text-sm">
              Auto-Refresh
            </span>
            <p className="text-zinc-500 text-xs mt-0.5">
              How often to fetch fresh prices
            </p>
          </div>
          <SegmentedControl
            options={REFRESH_OPTIONS}
            value={settings.autoRefreshInterval}
            onChange={setAutoRefreshInterval}
          />
        </section>

        {/* Currency */}
        <section className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-2xl p-4">
          <h2 className="text-zinc-400 dark:text-zinc-400 light:text-gray-500 text-xs uppercase tracking-wider mb-3">
            Currency
          </h2>
          <div className="mb-3">
            <span className="text-white dark:text-white light:text-gray-900 text-sm">
              Display Currency
            </span>
            <p className="text-zinc-500 text-xs mt-0.5">
              Prices and portfolio values will be converted
            </p>
          </div>
          <SegmentedControl
            options={CURRENCY_OPTIONS}
            value={settings.currency}
            onChange={setCurrency}
          />
        </section>

        {/* Danger Zone */}
        <section className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-red-900/40 rounded-2xl p-4">
          <h2 className="text-red-500 text-xs uppercase tracking-wider mb-3">
            Danger Zone
          </h2>

          {/* Clear portfolio */}
          <div className="flex items-center justify-between py-3 border-b border-zinc-800 dark:border-zinc-800 light:border-gray-100">
            <div>
              <p className="text-white dark:text-white light:text-gray-900 text-sm">
                Clear Portfolio
              </p>
              <p className="text-zinc-500 text-xs">
                {holdings.length} holding{holdings.length !== 1 ? "s" : ""}
              </p>
            </div>
            {confirmClear === "portfolio" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(null)}
                  className="text-zinc-400 text-sm px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={clearPortfolio}
                  className="text-white text-sm px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear("portfolio")}
                className="text-red-400 text-sm px-3 py-1 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Clear watchlist */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-white dark:text-white light:text-gray-900 text-sm">
                Clear Watchlist
              </p>
              <p className="text-zinc-500 text-xs">
                {watchlist.length} item{watchlist.length !== 1 ? "s" : ""}
              </p>
            </div>
            {confirmClear === "watchlist" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(null)}
                  className="text-zinc-400 text-sm px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={clearWatchlist}
                  className="text-white text-sm px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear("watchlist")}
                className="text-red-400 text-sm px-3 py-1 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
