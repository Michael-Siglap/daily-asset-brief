import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { FundamentalsData } from "@/lib/types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  try {
    const result = await yf.quoteSummary(symbol, {
      modules: ["summaryDetail", "financialData", "defaultKeyStatistics", "assetProfile"],
    });

    const sd = result.summaryDetail;
    const fd = result.financialData;
    const ks = result.defaultKeyStatistics;
    const ap = result.assetProfile;

    let exDivDate: string | null = null;
    if (sd?.exDividendDate) {
      const d = new Date(sd.exDividendDate);
      exDivDate = isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
    }

    const data: FundamentalsData = {
      symbol,
      dividendRate: sd?.dividendRate ?? null,
      dividendYield: sd?.dividendYield != null ? (sd.dividendYield as number) * 100 : null,
      exDividendDate: exDivDate,
      payoutRatio: sd?.payoutRatio != null ? (sd.payoutRatio as number) * 100 : null,
      peRatio: sd?.trailingPE ?? null,
      pbRatio: sd?.priceToBook != null ? (sd.priceToBook as number) : null,
      currentRatio: fd?.currentRatio ?? null,
      debtToEquity: fd?.debtToEquity ?? null,
      epsTrailing: ks?.trailingEps ?? null,
      revenueGrowth: fd?.revenueGrowth != null ? (fd.revenueGrowth as number) * 100 : null,
      profitMargins: fd?.profitMargins != null ? (fd.profitMargins as number) * 100 : null,
      totalCash: fd?.totalCash ?? null,
      totalDebt: fd?.totalDebt ?? null,
      freeCashflow: fd?.freeCashflow ?? null,
      returnOnEquity: fd?.returnOnEquity != null ? (fd.returnOnEquity as number) * 100 : null,
      sector: ap?.sector ?? null,
      industry: ap?.industry ?? null,
      description: ap?.longBusinessSummary ?? null,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("Fundamentals API error for", symbol, err);
    return NextResponse.json({ error: "Failed to fetch fundamentals" }, { status: 500 });
  }
}
