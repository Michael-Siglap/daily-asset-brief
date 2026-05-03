import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["USD", "EUR", "GBP", "JPY"] as const;
type Currency = (typeof SUPPORTED)[number];

// In-memory rate cache (process lifetime)
const rateCache: Map<
  string,
  { rates: Record<string, number>; fetchedAt: number }
> = new Map();
const CACHE_TTL = 3_600_000; // 1 hour

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = (searchParams.get("from") ?? "USD").toUpperCase() as Currency;
  const to = (searchParams.get("to") ?? "USD").toUpperCase() as Currency;

  if (!SUPPORTED.includes(from) || !SUPPORTED.includes(to)) {
    return NextResponse.json(
      { error: "Unsupported currency" },
      { status: 400 },
    );
  }

  if (from === to) {
    return NextResponse.json({ rate: 1 });
  }

  const cacheKey = from;
  const cached = rateCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return NextResponse.json(
      { rate: cached.rates[to] ?? 1 },
      {
        headers: { "Cache-Control": "public, max-age=3600" },
      },
    );
  }

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Frankfurter error");
    const data = await res.json();
    const rates: Record<string, number> = { ...data.rates, [from]: 1 };
    rateCache.set(cacheKey, { rates, fetchedAt: Date.now() });

    return NextResponse.json(
      { rate: rates[to] ?? 1 },
      {
        headers: { "Cache-Control": "public, max-age=3600" },
      },
    );
  } catch (err) {
    console.error("[currency]", err);
    return NextResponse.json({ rate: 1 });
  }
}
