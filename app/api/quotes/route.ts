import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { QuoteData } from "@/lib/types";
import { DEFAULT_WATCHLIST } from "@/lib/defaults";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function categoryForSymbol(symbol: string): string {
  if (symbol.startsWith("^")) return "index";
  if (symbol.endsWith("-USD") || ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"].includes(symbol)) return "crypto";
  if (symbol.endsWith("=F")) return "commodity";
  return "stock";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbols = searchParams.get("symbols");

  const symbolList = rawSymbols
    ? rawSymbols.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_WATCHLIST.map((d) => d.symbol);

  try {
    const results = await Promise.allSettled(
      symbolList.map((symbol) => yf.quote(symbol))
    );

    const defaultMap = Object.fromEntries(DEFAULT_WATCHLIST.map((d) => [d.symbol, d]));

    const quotes: QuoteData[] = results.map((result, i) => {
      const symbol = symbolList[i];
      const meta = defaultMap[symbol];

      if (result.status === "rejected") {
        return {
          symbol,
          name: meta?.name ?? symbol,
          price: null,
          change: null,
          changePercent: null,
          volume: null,
          marketCap: null,
          dayHigh: null,
          dayLow: null,
          fiftyTwoWeekHigh: null,
          fiftyTwoWeekLow: null,
          category: meta?.category ?? categoryForSymbol(symbol),
        };
      }

      const q = result.value;
      return {
        symbol,
        name: q.shortName ?? meta?.name ?? symbol,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePercent: q.regularMarketChangePercent ?? null,
        volume: q.regularMarketVolume ?? null,
        marketCap: q.marketCap ?? null,
        dayHigh: q.regularMarketDayHigh ?? null,
        dayLow: q.regularMarketDayLow ?? null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
        category: meta?.category ?? categoryForSymbol(symbol),
      };
    });

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("Quotes API error:", err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
