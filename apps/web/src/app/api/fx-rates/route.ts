import { NextRequest, NextResponse } from "next/server";
import { getAllFxRates, getFxRate } from "@/lib/db/queries/fx-rates";
import { fetchFxRates } from "@/lib/fx/fetcher";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base");
    const quote = searchParams.get("quote");
    const refresh = searchParams.get("refresh") === "true";

    if (refresh) {
      try {
        await fetchFxRates();
      } catch (err) {
        console.warn("FX rate refresh failed:", err);
      }
    }

    if (base && quote) {
      const rate = await getFxRate(base, quote);
      if (!rate) {
        return NextResponse.json({ error: "Rate not found" }, { status: 404 });
      }
      return NextResponse.json({
        baseCurrency: rate.baseCurrency,
        quoteCurrency: rate.quoteCurrency,
        rate: rate.rate,
        source: rate.source,
        fetchedAt: rate.fetchedAt?.toISOString(),
      });
    }

    const rates = await getAllFxRates();
    return NextResponse.json(
      rates.map((r) => ({
        baseCurrency: r.baseCurrency,
        quoteCurrency: r.quoteCurrency,
        rate: r.rate,
        source: r.source,
        fetchedAt: r.fetchedAt?.toISOString(),
      }))
    );
  } catch (error) {
    console.error("FX Rates API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
