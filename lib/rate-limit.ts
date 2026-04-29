type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  return { allowed, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}

export function rateLimitHeaders(remaining: number, resetAt: number) {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
  };
}
