import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  createdBy: string
  updatedBy: string
}

export class UserQueries {
  static async findByEmail(email: string) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1)

      return result[0] || null
    } catch (error) {
      console.error("Error finding user by email:", error)
      throw error
    }
  }

  static async findById(id: string) {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1)

      return result[0] || null
    } catch (error) {
      console.error("Error finding user by ID:", error)
      throw error
    }
  }

  static async create(userData: CreateUserData) {
    try {
      const result = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      return result[0]
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  static async upsert(userData: CreateUserData) {
    try {
      // First try to find existing user
      const existingUser = await this.findByEmail(userData.email)

      if (existingUser) {
        // Update existing user
        const result = await db
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

        return result[0]
      } else {
        // Create new user
        return await this.create(userData)
      }
    } catch (error) {
      console.error("Error upserting user:", error)
      throw error
    }
  }

  static async updateProfile(email: string, updates: Partial<CreateUserData>) {
    try {
      const result = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email))
        .returning()

      return result[0]
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  }

  static async delete(email: string) {
    try {
      const result = await db.delete(users).where(eq(users.email, email)).returning()

      return result[0]
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }
}
