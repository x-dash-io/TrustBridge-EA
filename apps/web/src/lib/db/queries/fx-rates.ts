import { db } from "@/lib/db";
import { fxRates, type NewFxRate } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getFxRate(baseCurrency: string, quoteCurrency: string) {
  const result = await db
    .select()
    .from(fxRates)
    .where(and(
      eq(fxRates.baseCurrency, baseCurrency.toUpperCase()),
      eq(fxRates.quoteCurrency, quoteCurrency.toUpperCase())
    ))
    .orderBy(desc(fxRates.fetchedAt))
    .limit(1);

  return result[0] || null;
}

export async function upsertFxRate(data: NewFxRate) {
  const existing = await getFxRate(data.baseCurrency, data.quoteCurrency);

  if (existing) {
    const result = await db
      .update(fxRates)
      .set({
        rate: data.rate,
        source: data.source || existing.source,
        fetchedAt: new Date(),
      })
      .where(eq(fxRates.id, existing.id))
      .returning();
    return result[0];
  }

  const result = await db.insert(fxRates).values(data).returning();
  return result[0];
}

export async function getAllFxRates() {
  return db.select().from(fxRates).orderBy(desc(fxRates.fetchedAt));
}
