import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const SCREENER_SYMBOLS = [
  "AAPL","MSFT","NVDA","TSLA","AMZN","GOOGL","META","AMD","NFLX","PYPL",
  "JPM","BAC","GS","WMT","PG","JNJ","XOM","CVX","BA","DIS",
  "BTC-USD","ETH-USD","SOL-USD","BNB-USD","XRP-USD",
  "GC=F","CL=F","SI=F","NG=F",
  "^GSPC","^IXIC","^DJI","SPY","QQQ",
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      SCREENER_SYMBOLS.map((s) => yf.quote(s))
    );

    const quotes = results
      .map((r, i) => {
        if (r.status === "rejected") return null;
        const q = r.value;
        return {
          symbol: SCREENER_SYMBOLS[i],
          name: q.shortName ?? SCREENER_SYMBOLS[i],
          price: q.regularMarketPrice ?? null,
          changePercent: q.regularMarketChangePercent ?? null,
          marketCap: q.marketCap ?? null,
        };
      })
      .filter(Boolean) as { symbol: string; name: string; price: number | null; changePercent: number | null; marketCap: number | null }[];

    const gainers = [...quotes]
      .filter((q) => q.changePercent != null && q.changePercent > 0)
      .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
      .slice(0, 10);

    const losers = [...quotes]
      .filter((q) => q.changePercent != null && q.changePercent < 0)
      .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
      .slice(0, 10);

    return NextResponse.json({ gainers, losers }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("Movers API error:", err);
    return NextResponse.json({ error: "Failed to fetch movers" }, { status: 500 });
  }
}
