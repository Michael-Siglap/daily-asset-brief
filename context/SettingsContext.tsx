"use client";
import type { AppSettings } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";

const DEFAULTS: AppSettings = {
  theme: "dark",
  autoRefreshInterval: 0,
  currency: "USD",
};

const STORAGE_KEY = "dab_settings";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: AppSettings["theme"]) => void;
  setAutoRefreshInterval: (
    interval: AppSettings["autoRefreshInterval"],
  ) => void;
  setCurrency: (currency: AppSettings["currency"]) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    const effective =
      settings.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : settings.theme;
    root.classList.remove("dark", "light");
    root.classList.add(effective);
  }, [settings.theme]);

  function updateSettings(updates: Partial<AppSettings>) {
    const next = { ...settings, ...updates };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        setTheme: (theme) => updateSettings({ theme }),
        setAutoRefreshInterval: (autoRefreshInterval) =>
          updateSettings({ autoRefreshInterval }),
        setCurrency: (currency) => updateSettings({ currency }),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
