import { kv } from '@vercel/kv';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter using Vercel KV (Redis)
 * Production-ready, distributed across all Vercel edge locations
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowInSeconds: number = 60
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowInSeconds;
  const redisKey = `ratelimit:${key}`;

  try {
    // Remove old entries outside the window
    await kv.zremrangebyscore(redisKey, 0, windowStart);

    // Count current requests in window
    const requestCount = await kv.zcard(redisKey);

    if (requestCount >= limit) {
      // Get the oldest entry to calculate reset time
      const oldest = await kv.zrange(redisKey, 0, 0, { rev: false });
      const resetTime = oldest.length > 0 
        ? parseInt(oldest[0] as string) + windowInSeconds 
        : now + windowInSeconds;

      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime
      };
    }

    // Add current request
    await kv.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });
    
    // Set expiry on the key
    await kv.expire(redisKey, windowInSeconds * 2);

    return {
      success: true,
      limit,
      remaining: limit - requestCount - 1,
      reset: now + windowInSeconds
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowInSeconds
    };
  }
}

/**
 * Check multiple rate limits simultaneously
 */
export async function checkRateLimits(
  ip: string,
  uid: string,
  threadId: string
): Promise<{ allowed: boolean; error?: string }> {
  // Check IP limit (20 req/min)
  const ipLimit = await rateLimit(`ip:${ip}`, 20, 60);
  if (!ipLimit.success) {
    return { allowed: false, error: 'Too many requests from your IP' };
  }

  // Check user limit (10 comments/min)
  if (uid) {
    const userLimit = await rateLimit(`user:${uid}`, 10, 60);
    if (!userLimit.success) {
      return { allowed: false, error: 'You are posting too quickly' };
    }
  }

  // Check thread limit (50 comments/min)
  const threadLimit = await rateLimit(`thread:${threadId}`, 50, 60);
  if (!threadLimit.success) {
    return { allowed: false, error: 'This thread is receiving too many comments' };
  }

  return { allowed: true };
}