import { NextResponse } from "next/server";
import { fetchFxRates } from "@/lib/fx/fetcher";

export async function GET() {
  try {
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
