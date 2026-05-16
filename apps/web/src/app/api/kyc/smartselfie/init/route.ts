import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { smileId } from "@/lib/kyc/smile-identity";
import { v4 as uuidv4 } from "uuid";
import { assertSmileIdConfigured } from "@/lib/compliance/limits";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request, "strict", "kyc:smartselfie:init");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product } = body;
    assertSmileIdConfigured();

    if (!product) {
      return NextResponse.json({ error: "Product type is required" }, { status: 400 });
    }

    const validProducts = [
      "biometric_kyc",
      "smartselfie",
      "basic_kyc",
      "enhanced_kyc",
      "doc_verification",
      "authentication",
    ];

    if (!validProducts.includes(product)) {
      return NextResponse.json({ error: `Invalid product. Must be one of: ${validProducts.join(", ")}` }, { status: 400 });
    }

    const jobId = `job-${uuidv4()}`;
    const userId = `user-${user.id}`;

    const result = await smileId.getWebToken({
      userId,
      jobId,
      product,
    });

    return NextResponse.json({
      token: result.token,
      jobId,
      partnerId: process.env.SMILE_ID_PARTNER_ID,
      environment: process.env.SMILE_ID_ENVIRONMENT || "sandbox",
      callbackUrl: process.env.SMILE_ID_CALLBACK_URL,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SmartSelfie init failed";
    console.error("SmartSelfie Init Error:", message);

    if (
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DEMO_DATA === "true" &&
      (!process.env.SMILE_ID_PARTNER_ID || !process.env.SMILE_ID_API_KEY)
    ) {
      return NextResponse.json({
        token: "mock-token-for-development",
        jobId: `job-mock-${Date.now()}`,
        partnerId: "mock-partner-id",
        environment: "sandbox",
        callbackUrl: `${request.nextUrl.origin}/api/webhooks/smile-id`,
        _mock: true,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
