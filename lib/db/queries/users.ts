import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq, desc, gte, sql } from "drizzle-orm"
import { SessionCache } from "@/lib/redis/session-cache"

export class UserQueries {
  static async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] || null
  }

  static async findById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0] || null
  }

  static async upsert(userData: {
    email: string
    firstName: string
    lastName: string
    avatarUrl: string
    createdBy: string
    updatedBy: string
  }) {
    const existing = await this.findByEmail(userData.email)

    if (existing) {
      // Update existing user
      const updated = await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUrl: userData.avatarUrl,
          updatedBy: userData.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email))
        .returning()

      const user = updated[0]

      // Update cache
      await SessionCache.setUser(userData.email, user)

      return user
    } else {
      // Create new user
      const created = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      const user = created[0]

      // Cache new user
      await SessionCache.setUser(userData.email, user)

      return user
    }
  }

  static async updateLastLogin(email: string) {
    const loginTime = new Date()

    const updated = await db
      .update(users)
      .set({
        lastLoggedInAt: loginTime,
        updatedAt: loginTime,
      })
      .where(eq(users.email, email))
      .returning()

    const user = updated[0]

    if (user) {
      // Update cache with new login time
      await SessionCache.setUser(email, user)

      // Also cache the login time separately for quick access
      await SessionCache.setLastLogin(email, loginTime)
    }

    return user
  }

  static async updateProfile(
    email: string,
    updates: {
      firstName?: string
      lastName?: string
      avatarUrl?: string
    },
  ) {
    const updated = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning()

    const user = updated[0]

    if (user) {
      // Update cache
      await SessionCache.setUser(email, user)
    }

    return user
  }

  static async getRecentlyActiveUsers(days = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        lastLoggedInAt: users.lastLoggedInAt,
      })
      .from(users)
      .where(gte(users.lastLoggedInAt, cutoffDate))
      .orderBy(desc(users.lastLoggedInAt))
  }

  static async getUserLoginStats() {
    const result = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        activeToday: sql<number>`count(case when last_logged_in_at >= current_date then 1 end)`,
        activeThisWeek: sql<number>`count(case when last_logged_in_at >= current_date - interval '7 days' then 1 end)`,
        activeThisMonth: sql<number>`count(case when last_logged_in_at >= current_date - interval '30 days' then 1 end)`,
      })
      .from(users)

    return result[0]
  }

  static async deleteUser(email: string) {
    // Remove from cache first
    await SessionCache.deleteUser(email)

    // Then delete from database
    return await db.delete(users).where(eq(users.email, email))
  }
}
