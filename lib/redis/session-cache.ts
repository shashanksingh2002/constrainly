import { redis, REDIS_KEYS } from "./index"
import type { User } from "@/lib/db/schema"

export class SessionCache {
  private static readonly TTL = 60 * 60 * 24 // 24 hours

  /**
   * Check if Redis is available
   */
  private static async isRedisAvailable(): Promise<boolean> {
    try {
      await redis.ping()
      return true
    } catch (error) {
      console.warn("Redis not available:", error)
      return false
    }
  }

  /**
   * Cache user data for faster session lookups
   */
  static async setUser(email: string, user: User): Promise<void> {
    try {
      if (!(await this.isRedisAvailable())) {
        console.warn("Redis unavailable, skipping user cache")
        return
      }

      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
        lastLoggedInAt: user.lastLoggedInAt?.toISOString() || null,
        createdBy: user.createdBy || "",
        updatedBy: user.updatedBy || "",
      }

      await redis.setex(`${REDIS_KEYS.USER_CACHE}${email}`, this.TTL, JSON.stringify(userData))
    } catch (error) {
      console.error("Failed to cache user:", error)
      // Don't throw - graceful degradation
    }
  }

  /**
   * Get cached user data
   */
  static async getUser(email: string): Promise<User | null> {
    try {
      if (!(await this.isRedisAvailable())) {
        return null
      }

      const cached = await redis.get(`${REDIS_KEYS.USER_CACHE}${email}`)
      if (!cached) {
        return null
      }

      const userData = JSON.parse(cached as string)

      // Convert string dates back to Date objects
      return {
        ...userData,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : null,
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : null,
        lastLoggedInAt: userData.lastLoggedInAt ? new Date(userData.lastLoggedInAt) : null,
      } as User
    } catch (error) {
      console.error("Failed to get cached user:", error)
      return null
    }
  }

  /**
   * Remove user from cache (on profile updates)
   */
  static async deleteUser(email: string): Promise<void> {
    try {
      if (!(await this.isRedisAvailable())) {
        return
      }

      await redis.del(`${REDIS_KEYS.USER_CACHE}${email}`)
    } catch (error) {
      console.error("Failed to delete cached user:", error)
      // Don't throw - graceful degradation
    }
  }

  /**
   * Cache session data
   */
  static async setSession(sessionToken: string, sessionData: any): Promise<void> {
    try {
      if (!(await this.isRedisAvailable())) {
        return
      }

      await redis.setex(`${REDIS_KEYS.SESSION}${sessionToken}`, this.TTL, JSON.stringify(sessionData))
    } catch (error) {
      console.error("Failed to cache session:", error)
      // Don't throw - graceful degradation
    }
  }

  /**
   * Get cached session data
   */
  static async getSession(sessionToken: string): Promise<any | null> {
    try {
      if (!(await this.isRedisAvailable())) {
        return null
      }

      const cached = await redis.get(`${REDIS_KEYS.SESSION}${sessionToken}`)
      return cached ? JSON.parse(cached as string) : null
    } catch (error) {
      console.error("Failed to get cached session:", error)
      return null
    }
  }

  /**
   * Clear all user-related cache entries
   */
  static async clearUserCache(email: string): Promise<void> {
    try {
      if (!(await this.isRedisAvailable())) {
        return
      }

      const keys = [`${REDIS_KEYS.USER_CACHE}${email}`, `${REDIS_KEYS.SESSION}${email}`]

      await Promise.all(keys.map((key) => redis.del(key)))
    } catch (error) {
      console.error("Failed to clear user cache:", error)
    }
  }
}
