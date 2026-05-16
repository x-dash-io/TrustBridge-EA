import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createKycSubmission } from "@/lib/db/queries/kyc";
import { smileId } from "@/lib/kyc/smile-identity";
import { v4 as uuidv4 } from "uuid";
import { assertSmileIdConfigured } from "@/lib/compliance/limits";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request, "strict", "kyc:submit");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    assertSmileIdConfigured();
    const { 
      tier, 
      idType, 
      idNumber, 
      country, 
      firstName, 
      lastName, 
      dob,
      frontImageUrl, 
      backImageUrl 
    } = body;

    // 1. Create Internal Record
    const submission = await createKycSubmission({
      userId: user.id,
      tier: tier || 2,
      documentType: idType,
      documentNumber: idNumber,
      country: country,
      status: "pending",
    });

    // 2. Call Smile Identity Enhanced KYC
    const smileRes = await smileId.submitEnhancedKyc({
      transaction_id: submission.id,
      user_id: user.id,
      id_number: idNumber,
      id_type: idType,
      country: country,
      first_name: firstName,
      last_name: lastName,
      dob: dob,
    });

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      smileJobId: smileRes.smile_job_id 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "KYC submission failed";
    console.error("KYC Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
