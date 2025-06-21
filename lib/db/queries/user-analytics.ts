import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { sql, desc, gte, isNotNull } from "drizzle-orm"

export class UserAnalytics {
  /**
   * Get comprehensive user login statistics
   */
  static async getLoginStats() {
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const result = await db
        .select({
          totalUsers: sql<number>`cast(count(*) as integer)`,
          usersWithLogin: sql<number>`cast(count(case when ${users.lastLoggedInAt} is not null then 1 end) as integer)`,
          activeToday: sql<number>`cast(count(case when ${users.lastLoggedInAt} >= ${today.toISOString()} then 1 end) as integer)`,
          activeThisWeek: sql<number>`cast(count(case when ${users.lastLoggedInAt} >= ${weekAgo.toISOString()} then 1 end) as integer)`,
          activeThisMonth: sql<number>`cast(count(case when ${users.lastLoggedInAt} >= ${monthAgo.toISOString()} then 1 end) as integer)`,
        })
        .from(users)

      return {
        totalUsers: Number(result[0]?.totalUsers || 0),
        usersWithLogin: Number(result[0]?.usersWithLogin || 0),
        activeToday: Number(result[0]?.activeToday || 0),
        activeThisWeek: Number(result[0]?.activeThisWeek || 0),
        activeThisMonth: Number(result[0]?.activeThisMonth || 0),
      }
    } catch (error) {
      console.error("Error in getLoginStats:", error)
      return {
        totalUsers: 0,
        usersWithLogin: 0,
        activeToday: 0,
        activeThisWeek: 0,
        activeThisMonth: 0,
      }
    }
  }

  /**
   * Get user activity timeline (daily login counts)
   */
  static async getDailyLoginCounts(days = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const result = await db
        .select({
          date: sql<string>`date(${users.lastLoggedInAt})`,
          loginCount: sql<number>`cast(count(*) as integer)`,
        })
        .from(users)
        .where(gte(users.lastLoggedInAt, startDate))
        .groupBy(sql`date(${users.lastLoggedInAt})`)
        .orderBy(sql`date(${users.lastLoggedInAt})`)

      return result.map((row) => ({
        date: row.date || "",
        loginCount: Number(row.loginCount || 0),
      }))
    } catch (error) {
      console.error("Error in getDailyLoginCounts:", error)
      return []
    }
  }

  /**
   * Get most active users by login frequency
   */
  static async getMostActiveUsers(limit = 10) {
    try {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          lastLoggedInAt: users.lastLoggedInAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(isNotNull(users.lastLoggedInAt))
        .orderBy(desc(users.lastLoggedInAt))
        .limit(limit)

      return result.map((user) => ({
        ...user,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        lastLoggedInAt: user.lastLoggedInAt?.toISOString() || new Date().toISOString(),
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Error in getMostActiveUsers:", error)
      return []
    }
  }

  /**
   * Get user retention metrics
   */
  static async getRetentionMetrics() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const result = await db
        .select({
          newUsersLast30Days: sql<number>`cast(count(case when ${users.createdAt} >= ${thirtyDaysAgo.toISOString()} then 1 end) as integer)`,
          activeUsersLast7Days: sql<number>`cast(count(case when ${users.lastLoggedInAt} >= ${sevenDaysAgo.toISOString()} then 1 end) as integer)`,
        })
        .from(users)

      const newUsers = Number(result[0]?.newUsersLast30Days || 0)
      const activeUsers = Number(result[0]?.activeUsersLast7Days || 0)
      const retentionRate = newUsers > 0 ? Math.round((activeUsers / newUsers) * 100 * 100) / 100 : 0

      return {
        newUsersLast30Days: newUsers,
        activeUsersLast7Days: activeUsers,
        retentionRate: retentionRate,
      }
    } catch (error) {
      console.error("Error in getRetentionMetrics:", error)
      return {
        newUsersLast30Days: 0,
        activeUsersLast7Days: 0,
        retentionRate: 0,
      }
    }
  }
}
