import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { UserAnalytics } from "@/lib/db/queries/user-analytics"
import { RateLimiter } from "@/lib/redis/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(`analytics:${session.user.email}`, RateLimiter.configs.api)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    // Get analytics data
    const [loginStats, dailyLogins, activeUsers, retention] = await Promise.all([
      UserAnalytics.getLoginStats(),
      UserAnalytics.getDailyLoginCounts(30),
      UserAnalytics.getMostActiveUsers(10),
      UserAnalytics.getRetentionMetrics(),
    ])

    return NextResponse.json({
      loginStats,
      dailyLogins,
      activeUsers,
      retention,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
