"use client";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex gap-1 bg-zinc-800/60 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-zinc-900 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        danger
          ? "bg-zinc-900 border-red-900/40"
          : "bg-zinc-900 border-zinc-800/60"
      }`}
    >
      <h2
        className={`text-xs uppercase tracking-wider mb-4 font-semibold ${
          danger ? "text-red-500" : "text-zinc-400"
        }`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { settings, setTheme, setAutoRefreshInterval, setCurrency } = useSettings();
  const { holdings, watchlist } = usePortfolio();
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState<"portfolio" | "watchlist" | null>(null);

  function clearPortfolio() {
    localStorage.setItem("dab_portfolio", "[]");
    toast("Portfolio cleared", "info");
    window.location.reload();
  }

  function clearWatchlist() {
    localStorage.setItem("dab_watchlist", "[]");
    toast("Watchlist cleared", "info");
    window.location.reload();
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-8 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="md:hidden text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <Section title="Appearance">
          <div className="space-y-3">
            <div>
              <p className="text-white text-sm font-medium mb-2">Theme</p>
              <SegmentedControl options={THEME_OPTIONS} value={settings.theme} onChange={setTheme} />
            </div>
          </div>
        </Section>

        {/* Data */}
        <Section title="Data">
          <div className="space-y-4">
            <div>
              <p className="text-white text-sm font-medium">Auto-Refresh</p>
              <p className="text-zinc-500 text-xs mt-0.5 mb-2">How often to fetch fresh prices</p>
              <SegmentedControl
                options={REFRESH_OPTIONS}
                value={settings.autoRefreshInterval}
                onChange={setAutoRefreshInterval}
              />
            </div>
          </div>
        </Section>

        {/* Currency */}
        <Section title="Currency">
          <div>
            <p className="text-white text-sm font-medium">Display Currency</p>
            <p className="text-zinc-500 text-xs mt-0.5 mb-2">Prices and portfolio values will be converted</p>
            <SegmentedControl
              options={CURRENCY_OPTIONS}
              value={settings.currency}
              onChange={setCurrency}
            />
          </div>
        </Section>

        {/* About */}
        <Section title="About">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
              <span className="text-zinc-400 text-sm">App</span>
              <span className="text-white text-sm font-medium">Daily Asset Brief</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
              <span className="text-zinc-400 text-sm">Data source</span>
              <span className="text-white text-sm font-medium">Yahoo Finance</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-400 text-sm">Market hours</span>
              <span className="text-white text-sm font-medium">9:30 AM – 4:00 PM ET</span>
            </div>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone" danger>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Clear Portfolio</p>
                <p className="text-zinc-500 text-xs">
                  {holdings.length} holding{holdings.length !== 1 ? "s" : ""}
                </p>
              </div>
              {confirmClear === "portfolio" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClear(null)}
                    className="text-zinc-400 text-sm px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearPortfolio}
                    className="text-white text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear("portfolio")}
                  className="text-red-400 text-sm px-3 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
              <div>
                <p className="text-white text-sm font-medium">Clear Watchlist</p>
                <p className="text-zinc-500 text-xs">
                  {watchlist.length} item{watchlist.length !== 1 ? "s" : ""}
                </p>
              </div>
              {confirmClear === "watchlist" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClear(null)}
                    className="text-zinc-400 text-sm px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearWatchlist}
                    className="text-white text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear("watchlist")}
                  className="text-red-400 text-sm px-3 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
