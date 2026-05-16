import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { kycSubmissions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  rejectionReason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "kyc:approve", "kyc:reject");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { status, rejectionReason } = parsed.data;

    const submission = await db
      .select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.id, id))
      .limit(1)
      .then((r) => r[0] || null);

    if (!submission) {
      return NextResponse.json({ error: "KYC submission not found" }, { status: 404 });
    }

    await db
      .update(kycSubmissions)
      .set({ status, rejectionReason, reviewedAt: new Date() })
      .where(eq(kycSubmissions.id, id));

    if (status === "verified") {
      await db
        .update(users)
        .set({ kycTier: submission.tier, kycStatus: "verified" })
        .where(eq(users.id, submission.userId!));
    } else {
      await db
        .update(users)
        .set({ kycStatus: "rejected" })
        .where(eq(users.id, submission.userId!));
    }

    await logAuditEvent({
      transactionId: null,
      actorId: user.id,
      actorRole: "compliance_officer",
      action: status === "verified" ? "KYC_APPROVED" : "KYC_REJECTED",
      metadata: { submissionId: id, tier: submission.tier, rejectionReason },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
