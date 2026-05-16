import { type NextRequest, NextResponse } from "next/server";
import { updateKycStatus } from "@/lib/db/queries/kyc";
import { logAuditEvent } from "@/lib/db/queries/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Smile ID sends Results or Actions in the callback
    const { 
      ResultCode, 
      ResultText, 
      SmileJobID, 
      PartnerParams,
      Actions
    } = body;

    const submissionId = PartnerParams?.transaction_id;
    const userId = PartnerParams?.user_id;

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
    }

    // Check if actions passed (Verify_ID_Number, etc.)
    const idVerified = Actions?.Verify_ID_Number === "Passed";
    const livenessVerified = Actions?.Liveness_Check === "Passed" || !Actions?.Liveness_Check; // Some jobs don't have liveness

    if (ResultCode === "0812" || (idVerified && livenessVerified)) {
      // SUCCESS
      await updateKycStatus(submissionId, "verified");
      
      await logAuditEvent({
        transactionId: null, // Global event
        actorId: userId,
        actorRole: "user",
        action: "KYC_VERIFIED",
        metadata: { submissionId, smileJobId: SmileJobID, resultCode: ResultCode },
      });
    } else {
      // FAILED
      await updateKycStatus(submissionId, "rejected", ResultText || "Verification failed");
      
      await logAuditEvent({
        transactionId: null,
        actorId: userId,
        actorRole: "user",
        action: "KYC_REJECTED",
        metadata: { submissionId, smileJobId: SmileJobID, resultText: ResultText },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("SmileID Webhook Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
