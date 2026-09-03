interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * In-memory rate limiter for development
 * WARNING: Not suitable for production (not distributed, lost on restart)
 */
export async function rateLimitDev(
  key: string,
  limit: number,
  windowInSeconds: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowInSeconds * 1000
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: entry?.resetTime || now + windowInSeconds * 1000
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime
  };
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);