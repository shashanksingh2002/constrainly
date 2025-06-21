import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth/config"
import { UserAnalytics } from "@/lib/db/queries/user-analytics"
import { RateLimiter } from "@/lib/redis/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(authConfig)) as { user?: { email?: string } } | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting with error handling
    let rateLimitResult
    try {
      rateLimitResult = await RateLimiter.checkLimit(`analytics:${session.user.email}`, RateLimiter.configs.api)
    } catch (rateLimitError) {
      console.warn("Rate limiting failed, allowing request:", rateLimitError)
      // Continue without rate limiting if Redis is down
      rateLimitResult = { success: true, max: 100, remaining: 99, resetTime: Date.now() + 60000 }
    }

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult?.max?.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    // Get analytics data with individual error handling
    const results = await Promise.allSettled([
      UserAnalytics.getLoginStats(),
      UserAnalytics.getDailyLoginCounts(30),
      UserAnalytics.getMostActiveUsers(10),
      UserAnalytics.getRetentionMetrics(),
    ])

    // Extract results or use defaults
    const loginStats =
      results[0].status === "fulfilled"
        ? results[0].value
        : {
            totalUsers: 0,
            usersWithLogin: 0,
            activeToday: 0,
            activeThisWeek: 0,
            activeThisMonth: 0,
          }

    const dailyLogins = results[1].status === "fulfilled" ? results[1].value : []
    const activeUsers = results[2].status === "fulfilled" ? results[2].value : []
    const retention =
      results[3].status === "fulfilled"
        ? results[3].value
        : {
            newUsersLast30Days: 0,
            activeUsersLast7Days: 0,
            retentionRate: 0,
          }

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Analytics query ${index} failed:`, result.reason)
      }
    })

    return NextResponse.json({
      loginStats,
      dailyLogins,
      activeUsers,
      retention,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
