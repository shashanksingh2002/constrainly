import { redis, REDIS_KEYS } from "./index"
import type { User } from "@/lib/db/schema"

export class SessionCache {
  private static readonly TTL = 60 * 60 * 24 // 24 hours

  /**
   * Cache user data for faster session lookups
   */
  static async setUser(email: string, user: User): Promise<void> {
    try {
      await redis.setex(`${REDIS_KEYS.USER_CACHE}${email}`, this.TTL, JSON.stringify(user))
    } catch (error) {
      console.error("Failed to cache user:", error)
    }
  }

  /**
   * Get cached user data
   */
  static async getUser(email: string): Promise<User | null> {
    try {
      const cached = await redis.get(`${REDIS_KEYS.USER_CACHE}${email}`)
      return cached ? JSON.parse(cached as string) : null
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
      await redis.del(`${REDIS_KEYS.USER_CACHE}${email}`)
    } catch (error) {
      console.error("Failed to delete cached user:", error)
    }
  }

  /**
   * Cache session data
   */
  static async setSession(sessionToken: string, sessionData: any): Promise<void> {
    try {
      await redis.setex(`${REDIS_KEYS.SESSION}${sessionToken}`, this.TTL, JSON.stringify(sessionData))
    } catch (error) {
      console.error("Failed to cache session:", error)
    }
  }

  /**
   * Get cached session data
   */
  static async getSession(sessionToken: string): Promise<any | null> {
    try {
      const cached = await redis.get(`${REDIS_KEYS.SESSION}${sessionToken}`)
      return cached ? JSON.parse(cached as string) : null
    } catch (error) {
      console.error("Failed to get cached session:", error)
      return null
    }
  }
}
