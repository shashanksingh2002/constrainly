import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { SessionCache } from "@/lib/redis/session-cache"

export class UserQueries {
  static async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
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

  static async deleteUser(email: string) {
    // Remove from cache first
    await SessionCache.deleteUser(email)

    // Then delete from database
    return await db.delete(users).where(eq(users.email, email))
  }
}
