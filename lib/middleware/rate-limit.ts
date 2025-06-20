import { type NextRequest, NextResponse } from "next/server"
import { RateLimiter, type RateLimitConfig } from "@/lib/redis/rate-limiter"

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    // Get identifier (IP address or user ID)
    const identifier = getClientIdentifier(req)

    // Check rate limit
    const result = await RateLimiter.checkLimit(identifier, config)

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded",
          retryAfter: result.resetTime,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": config.requests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetTime.toString(),
            "Retry-After": (result.resetTime - Math.floor(Date.now() / 1000)).toString(),
          },
        },
      )
    }

    // Add rate limit headers to successful responses
    const response = await handler(req)

    response.headers.set("X-RateLimit-Limit", config.requests.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString())

    return response
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get user ID from session/token first
  const authHeader = req.headers.get("authorization")
  if (authHeader) {
    // Extract user ID from JWT or session
    // This is a simplified version - you might want to decode the actual token
    return `user:${authHeader.slice(0, 20)}`
  }

  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown"
  return `ip:${ip}`
}
