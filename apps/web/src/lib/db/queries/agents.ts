import { db } from "@/lib/db";
import { agents, agentAssignments, type NewAgent, type NewAgentAssignment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAllAgents() {
  return db.select().from(agents).where(eq(agents.isActive, true));
}

export async function getAgentById(id: string) {
  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createAgent(data: NewAgent) {
  const result = await db.insert(agents).values(data).returning();
  return result[0];
}

export async function getAgentAssignments(agentId: string) {
  return db
    .select()
    .from(agentAssignments)
    .where(eq(agentAssignments.agentId, agentId));
}

export async function createAgentAssignment(data: NewAgentAssignment) {
  const result = await db.insert(agentAssignments).values(data).returning();
  return result[0];
}
