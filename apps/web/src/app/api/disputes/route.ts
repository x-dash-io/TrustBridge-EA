import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data for resolution center
    const disputes = [
      {
        id: "dsp-01",
        transactionRef: "TX-9482-110",
        title: "Non-delivery of Digital Asset: scale.ai",
        status: "mediation",
        severity: "high",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dsp-02",
        transactionRef: "TX-1102-552",
        title: "Quality Dispute: Batch #412 Machinery",
        status: "evidence-required",
        severity: "medium",
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    return NextResponse.json(disputes);
  } catch (error) {
    console.error("Disputes API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
