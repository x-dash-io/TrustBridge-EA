import { db } from "@/lib/db";
import { kycSubmissions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type NewKycSubmission = typeof kycSubmissions.$inferInsert;

export async function createKycSubmission(data: NewKycSubmission) {
  const result = await db.insert(kycSubmissions).values(data).returning();
  return result[0];
}

export async function updateKycStatus(submissionId: string, status: string, rejectionReason?: string) {
  const result = await db
    .update(kycSubmissions)
    .set({ status, rejectionReason, reviewedAt: new Date() })
    .where(eq(kycSubmissions.id, submissionId))
    .returning();

  const submission = result[0];
  
  if (submission && status === "verified") {
    // Also update the user's tier
    await db
      .update(users)
      .set({ kycTier: submission.tier, kycStatus: "verified" })
      .where(eq(users.id, submission.userId!));
  } else if (submission && status === "rejected") {
    await db
      .update(users)
      .set({ kycStatus: "rejected" })
      .where(eq(users.id, submission.userId!));
  }

  return submission;
}

export async function getLatestKycSubmission(userId: string) {
  const result = await db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.userId, userId))
    .orderBy(kycSubmissions.submittedAt)
    .limit(1);

  return result[0] || null;
}
