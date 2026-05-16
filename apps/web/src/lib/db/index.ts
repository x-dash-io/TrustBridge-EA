import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const allowMissingDatabaseUrl =
  process.env.NODE_ENV === "test" ||
  process.env.NODE_ENV === "development" ||
  process.env.ENABLE_DEMO_DATA === "true" ||
  process.env.NEXT_PHASE === "phase-production-build";

if (!connectionString && !allowMissingDatabaseUrl) {
  throw new Error("DATABASE_URL is required outside development/demo/test mode.");
}

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Using local placeholder database URL for development/demo only.");
}

const client = postgres(connectionString || "postgres://localhost:5432/placeholder");
export const db = drizzle(client, { schema });
