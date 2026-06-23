// In-memory rate limiting map for Hackathon purposes
// Production would use Redis or DynamoDB TTL

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const limits = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = limits.get(ip);

  if (!entry) {
    limits.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // Allowed
  }

  if (now > entry.resetAt) {
    // Window expired, reset
    limits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false; // Rate limited
  }

  entry.count++;
  return true;
}
