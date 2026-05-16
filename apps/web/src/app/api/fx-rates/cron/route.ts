import { NextResponse } from "next/server";
import { fetchFxRates } from "@/lib/fx/fetcher";
import { rateLimit, requireCronSecret } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  try {
    const unauthorized = requireCronSecret(request);
    if (unauthorized) return unauthorized;
    const limited = await rateLimit(request, "cron", "fx-rates");
    if (limited) return limited;

    const results = await fetchFxRates();
    return NextResponse.json({
      success: true,
      updated: results.length,
      pairs: results,
    });
  } catch (error) {
    console.error("FX Cron Error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
