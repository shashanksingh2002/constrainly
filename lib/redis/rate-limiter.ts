import { redis, REDIS_KEYS } from "./index"

export interface RateLimitConfig {
  requests: number
  window: number // seconds
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export class RateLimiter {
  /**
   * Check and apply rate limiting using sliding window
   */
  static async checkLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = `${REDIS_KEYS.RATE_LIMIT}${identifier}`
    const now = Date.now()
    const window = config.window * 1000 // convert to milliseconds

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline()

      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, now - window)

      // Count current requests
      pipeline.zcard(key)

      // Add current request
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })

      // Set expiration
      pipeline.expire(key, config.window)

      const results = await pipeline.exec()
      const currentCount = (results[1] as number) || 0

      if (currentCount >= config.requests) {
        // Rate limit exceeded
        const oldestRequest = await redis.zrange(key, 0, 0, { withScores: true })
        const resetTime =
          oldestRequest.length > 0
            ? Math.ceil((oldestRequest[0].score + window) / 1000)
            : Math.ceil((now + window) / 1000)

        return {
          success: false,
          remaining: 0,
          resetTime,
        }
      }

      return {
        success: true,
        remaining: config.requests - currentCount - 1,
        resetTime: Math.ceil((now + window) / 1000),
      }
    } catch (error) {
      console.error("Rate limiting error:", error)
      // Fail open - allow request if Redis is down
      return {
        success: true,
        remaining: config.requests - 1,
        resetTime: Math.ceil((now + window) / 1000),
      }
    }
  }

  /**
   * Predefined rate limit configurations
   */
  static readonly configs = {
    // API endpoints
    api: { requests: 100, window: 60 }, // 100 requests per minute
    auth: { requests: 5, window: 60 }, // 5 auth attempts per minute
    generation: { requests: 10, window: 60 }, // 10 generations per minute

    // User actions
    strict: { requests: 10, window: 60 }, // 10 requests per minute
    moderate: { requests: 50, window: 60 }, // 50 requests per minute
    lenient: { requests: 200, window: 60 }, // 200 requests per minute
  } as const
}
