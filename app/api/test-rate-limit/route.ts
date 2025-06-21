import { type NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/middleware/rate-limit"
import { RateLimiter } from "@/lib/redis/rate-limiter"

async function handler(req: NextRequest) {
  return NextResponse.json({
    message: "Rate limit test successful",
    timestamp: new Date().toISOString(),
  })
}

// Apply rate limiting: 5 requests per minute
export const GET = (req: NextRequest) =>
  withRateLimit(RateLimiter.configs.auth)(req, handler)
