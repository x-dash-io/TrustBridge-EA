import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDisputesByUserId } from "@/lib/db/queries/disputes";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, "general", "disputes:get");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const disputes = await getDisputesByUserId(user.id);

    return NextResponse.json(disputes.map((d) => ({
      id: d.id,
      transactionId: d.transactionId,
      milestoneId: d.milestoneId,
      status: d.status,
      resolutionTier: d.resolutionTier,
      updatedAt: d.resolvedAt?.toISOString() || d.openedAt?.toISOString(),
    })));
  } catch (error) {
    console.error("Disputes API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
