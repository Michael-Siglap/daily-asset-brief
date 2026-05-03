import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

const RANGE_MAP: Record<string, { period1: string; interval: "1m"|"2m"|"5m"|"15m"|"30m"|"60m"|"90m"|"1h"|"1d"|"5d"|"1wk"|"1mo"|"3mo" }> = {
  "1d":  { period1: "1d",  interval: "5m"  },
  "5d":  { period1: "5d",  interval: "15m" },
  "1mo": { period1: "1mo", interval: "1d"  },
  "3mo": { period1: "3mo", interval: "1d"  },
  "6mo": { period1: "6mo", interval: "1wk" },
  "1y":  { period1: "1y",  interval: "1wk" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") ?? "1mo";

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const config = RANGE_MAP[range] ?? RANGE_MAP["1mo"];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await yahooFinance.chart(symbol, {
      period1: config.period1,
      interval: config.interval,
    }) as any;

    const bars = ((result.quotes ?? result.indicators?.quote?.[0] ?? []) as any[])
      .filter((q) => q.open != null && q.close != null)
      .map((q) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open!,
        high: q.high!,
        low: q.low!,
        close: q.close!,
        volume: q.volume ?? 0,
      }));

    return NextResponse.json(bars, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error(`[history] ${symbol}:`, err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
