import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import type { SearchResult } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await yahooFinance.search(q, { newsCount: 0 }) as any;

    const quotes: SearchResult[] = ((result.quotes ?? []) as any[])
      .filter((item) => item.symbol && item.quoteType !== "MUTUALFUND")
      .slice(0, 10)
      .map((item) => ({
        symbol: item.symbol,
        name: ("longname" in item && item.longname) ? String(item.longname) :
              ("shortname" in item && item.shortname) ? String(item.shortname) : item.symbol,
        exchange: ("exchange" in item && item.exchange) ? String(item.exchange) : "",
        quoteType: item.quoteType ?? "",
      }));

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=10" },
    });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json([], { status: 200 });
  }
}
