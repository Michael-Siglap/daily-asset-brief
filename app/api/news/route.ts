import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { NewsItem } from "@/lib/types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const MARKET_SYMBOLS = ["SPY", "QQQ", "^GSPC", "BTC-USD", "GC=F", "CL=F"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbols = searchParams.get("symbols");
  const mode = searchParams.get("mode") ?? "portfolio";

  const symbolList = mode === "market"
    ? MARKET_SYMBOLS
    : (rawSymbols ? rawSymbols.split(",").map((s) => s.trim()).filter(Boolean) : MARKET_SYMBOLS);

  try {
    const newsMap = new Map<string, NewsItem>();

    await Promise.allSettled(
      symbolList.map(async (symbol) => {
        try {
          const result = await yf.search(symbol, { newsCount: 8, quotesCount: 0 });
          for (const item of result.news ?? []) {
            if (!newsMap.has(item.link)) {
              newsMap.set(item.link, {
                title: item.title,
                publisher: item.publisher,
                link: item.link,
                publishedAt: new Date((item.providerPublishTime as unknown as number) * 1000).toISOString(),
                relatedSymbols: [symbol],
                thumbnail: (item as { thumbnail?: { resolutions?: { url: string }[] } }).thumbnail?.resolutions?.[0]?.url,
              });
            } else {
              const existing = newsMap.get(item.link)!;
              if (!existing.relatedSymbols.includes(symbol)) {
                existing.relatedSymbols.push(symbol);
              }
            }
          }
        } catch {
          // skip failed symbol
        }
      })
    );

    const news = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 40);

    return NextResponse.json(news, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("News API error:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
