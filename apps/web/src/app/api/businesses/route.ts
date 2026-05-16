import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createBusinessSchema = z.object({
  legalName: z.string().min(3),
  registrationNumber: z.string().min(3),
  kraPin: z.string().min(11).max(11),
  country: z.string().default("KE"),
  businessType: z.string().min(1),
  directorName: z.string().min(3),
  directorIdNumber: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createBusinessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Check if business already exists by KRA PIN
    const existing = await db
      .select()
      .from(businesses)
      .where(eq(businesses.kraPin, data.kraPin))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Business with this KRA PIN already registered" }, { status: 409 });
    }

    const business = await db
      .insert(businesses)
      .values({
        ownerId: user.id,
        legalName: data.legalName,
        registrationNumber: data.registrationNumber,
        kraPin: data.kraPin,
        country: data.country,
        kycStatus: "pending",
      })
      .returning();

    await logAuditEvent({
      transactionId: null,
      actorId: user.id,
      actorRole: "buyer",
      action: "BUSINESS_REGISTERED",
      metadata: {
        businessId: business[0]?.id,
        legalName: data.legalName,
        kraPin: data.kraPin,
      },
    });

    return NextResponse.json(business[0]);
  } catch (error) {
    console.error("Business Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
