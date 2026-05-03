"use client";
import { useEffect, useState, useCallback } from "react";
import type { QuoteData } from "@/lib/types";

export function useQuotes(symbols?: string[]) {
  const [data, setData] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = symbols?.length ? `?symbols=${symbols.join(",")}` : "";
      const res = await fetch(`/api/quotes${qs}`);
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [symbols?.join(",")]);  // eslint-disable-line

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

export function useFundamentals(symbol: string | null) {
  const [data, setData] = useState<import("@/lib/types").FundamentalsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    fetch(`/api/fundamentals?symbol=${symbol}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, loading };
}

export function useNews(symbols: string[], mode: "portfolio" | "market" = "portfolio") {
  const [data, setData] = useState<import("@/lib/types").NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = symbols.length ? `&symbols=${symbols.join(",")}` : "";
    fetch(`/api/news?mode=${mode}${qs}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [symbols.join(","), mode]);  // eslint-disable-line

  return { data, loading };
}

export function useMovers() {
  const [data, setData] = useState<{ gainers: QuoteData[]; losers: QuoteData[] }>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movers")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
