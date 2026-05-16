import { upsertFxRate } from "@/lib/db/queries/fx-rates";

const currencyPairs: Array<{ base: string; quote: string }> = [
  { base: "KES", quote: "UGX" },
  { base: "KES", quote: "TZS" },
  { base: "KES", quote: "RWF" },
  { base: "KES", quote: "USD" },
  { base: "KES", quote: "EUR" },
  { base: "KES", quote: "GBP" },
  { base: "USD", quote: "KES" },
  { base: "EUR", quote: "KES" },
  { base: "GBP", quote: "KES" },
];

export async function fetchFxRates() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    console.warn("EXCHANGE_RATE_API_KEY not set. FX rates will not be fetched.");
    return [];
  }

  const results: Array<{ base: string; quote: string; rate: string }> = [];

  for (const pair of currencyPairs) {
    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${pair.base}/${pair.quote}`,
        { next: { revalidate: 3600 } }
      );

      if (!res.ok) continue;

      const data = await res.json();
      if (data.result === "success") {
        const rate = data.conversion_rate.toString();

        await upsertFxRate({
          baseCurrency: pair.base,
          quoteCurrency: pair.quote,
          rate,
          source: "exchangerate-api",
        });

        results.push({ base: pair.base, quote: pair.quote, rate });
      }
    } catch (err) {
      console.warn(`Failed to fetch ${pair.base}/${pair.quote}:`, err);
    }
  }

  return results;
}
