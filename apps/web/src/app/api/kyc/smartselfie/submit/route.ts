import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { smileId } from "@/lib/kyc/smile-identity";
import { createKycSubmission } from "@/lib/db/queries/kyc";
import { assertSmileIdConfigured } from "@/lib/compliance/limits";
import { rateLimit } from "@/lib/security/rate-limit";

const JOB_TYPES: Record<string, number> = {
  BIOMETRIC_KYC: 1,
  SMART_SELFIE_AUTHENTICATION: 2,
  SMART_SELFIE_REGISTRATION: 4,
  BASIC_KYC: 5,
  ENHANCED_KYC: 5,
  DOCUMENT_VERIFICATION: 6,
  BUSINESS_VERIFICATION: 7,
  UPDATE_PHOTO: 8,
  COMPARE_USER_INFO: 9,
  ENHANCED_DOCUMENT_VERIFICATION: 11,
};

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request, "strict", "kyc:smartselfie:submit");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    assertSmileIdConfigured();
    const { images, jobId, jobType, idInfo } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    const partnerParams = {
      user_id: `user-${user.id}`,
      job_id: jobId || `job-${Date.now()}`,
      job_type: jobType || JOB_TYPES.SMART_SELFIE_REGISTRATION,
    };

    const submission = await createKycSubmission({
      userId: user.id,
      tier: 2,
      smileJobId: partnerParams.job_id,
      documentType: idInfo?.id_type || "unknown",
      documentNumber: idInfo?.id_number || "",
      country: idInfo?.country || "KE",
      status: "pending",
    });

    const result = await smileId.submitJob(partnerParams, images, {
      return_job_status: true,
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      smileJobId: result.smile_job_id,
      jobStatus: result.job_status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SmartSelfie submission failed";
    console.error("SmartSelfie Submit Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
