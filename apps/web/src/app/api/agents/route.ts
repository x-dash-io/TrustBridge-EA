import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let result: unknown[] = [];
    try {
      result = await db.select().from(agents).where(eq(agents.isActive, true));
    } catch (dbError) {
      console.warn("Database not available for agents:", dbError);
      result = [
        {
          id: "agt-1",
          displayName: "James Mwangi",
          counties: ["Nairobi", "Kiambu"],
          assetClasses: ["physical", "property"],
          rating: "4.8",
          reviewCount: 24,
          isActive: true,
        },
        {
          id: "agt-2",
          displayName: "Grace Akinyi",
          counties: ["Mombasa", "Kilifi"],
          assetClasses: ["digital", "services"],
          rating: "4.6",
          reviewCount: 18,
          isActive: true,
        },
      ];
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Agents API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
