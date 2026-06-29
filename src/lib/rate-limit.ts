import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 5 requests per 10 minutes by default
// We initialize Redis only if the env vars are present to avoid crashing locally if not setup.
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
  });
}

/**
 * Checks if the given IP has exceeded the rate limit.
 * Uses Upstash Redis for distributed edge-compatible rate limiting.
 * Falls back to allowing the request if Upstash is not configured.
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  if (!ratelimit) {
    console.warn("⚠️ Rate limiter is bypassed because UPSTASH_REDIS_REST_URL is missing.");
    return process.env.NODE_ENV === "development"; // Fail closed in production if misconfigured
  }

  try {
    const { success } = await ratelimit.limit(ip);
    return success;
  } catch (error) {
    console.error("[CRITICAL] Rate limit check failed:", error);
    // If Redis goes down, we fail open so legitimate users aren't blocked
    return true;
  }
}
