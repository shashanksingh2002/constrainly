import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { sql, desc, gte } from "drizzle-orm"

export class UserAnalytics {
  /**
   * Get comprehensive user login statistics
   */
  static async getLoginStats() {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const result = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        usersWithLogin: sql<number>`count(case when last_logged_in_at is not null then 1 end)`,
        activeToday: sql<number>`count(case when last_logged_in_at >= ${today} then 1 end)`,
        activeThisWeek: sql<number>`count(case when last_logged_in_at >= ${weekAgo} then 1 end)`,
        activeThisMonth: sql<number>`count(case when last_logged_in_at >= ${monthAgo} then 1 end)`,
        avgLoginsPerUser: sql<number>`avg(case when last_logged_in_at is not null then 1 else 0 end)`,
      })
      .from(users)

    return result[0]
  }

  /**
   * Get user activity timeline (daily login counts)
   */
  static async getDailyLoginCounts(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await db
      .select({
        date: sql<string>`date(last_logged_in_at)`,
        loginCount: sql<number>`count(*)`,
      })
      .from(users)
      .where(gte(users.lastLoggedInAt, startDate))
      .groupBy(sql`date(last_logged_in_at)`)
      .orderBy(sql`date(last_logged_in_at)`)
  }

  /**
   * Get most active users by login frequency
   */
  static async getMostActiveUsers(limit = 10) {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        lastLoggedInAt: users.lastLoggedInAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(sql`last_logged_in_at is not null`)
      .orderBy(desc(users.lastLoggedInAt))
      .limit(limit)
  }

  /**
   * Get user retention metrics
   */
  static async getRetentionMetrics() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return await db
      .select({
        newUsersLast30Days: sql<number>`count(case when created_at >= ${thirtyDaysAgo} then 1 end)`,
        activeUsersLast7Days: sql<number>`count(case when last_logged_in_at >= ${sevenDaysAgo} then 1 end)`,
        retentionRate: sql<number>`
          round(
            (count(case when last_logged_in_at >= ${sevenDaysAgo} then 1 end)::float / 
             nullif(count(case when created_at >= ${thirtyDaysAgo} then 1 end), 0)) * 100, 
            2
          )
        `,
      })
      .from(users)
  }
}
