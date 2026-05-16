import { NextResponse, type NextRequest } from "next/server";

type Bucket = "strict" | "general" | "cron";

const BUCKETS: Record<Bucket, { limit: number; windowSeconds: number }> = {
  strict: { limit: 10, windowSeconds: 60 },
  general: { limit: 120, windowSeconds: 60 },
  cron: { limit: 5, windowSeconds: 60 },
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: NextRequest | Request, suffix: string) {
  const headers = request.headers;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${suffix}`;
}

async function upstashIncrement(key: string, windowSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const encodedKey = encodeURIComponent(key);
  const headers = { Authorization: `Bearer ${token}` };
  const incr = await fetch(`${url}/incr/${encodedKey}`, { headers, cache: "no-store" });
  const count = Number((await incr.json()).result || 0);
  if (count === 1) {
    await fetch(`${url}/expire/${encodedKey}/${windowSeconds}`, { headers, cache: "no-store" });
  }
  return count;
}

function memoryIncrement(key: string, windowSeconds: number) {
  const now = Date.now();
  const current = memoryStore.get(key);
  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return 1;
  }
  current.count += 1;
  return current.count;
}

export async function rateLimit(request: NextRequest | Request, bucket: Bucket, suffix: string) {
  const config = BUCKETS[bucket];
  const key = `ratelimit:${bucket}:${clientKey(request, suffix)}`;
  const count = (await upstashIncrement(key, config.windowSeconds)) ?? memoryIncrement(key, config.windowSeconds);

  if (count > config.limit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return null;
}

export function requireCronSecret(request: NextRequest | Request) {
  const expected = process.env.CRON_SECRET;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.headers.get("x-cron-secret");

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
