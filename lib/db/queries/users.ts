import { eq } from "drizzle-orm"
import { db, users, type User, type NewUser } from "@/lib/db"

export class UserQueries {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] || null
  }

  static async create(userData: NewUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning()
    return result[0]
  }

  static async update(email: string, userData: Partial<NewUser>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning()
    return result[0]
  }

  static async upsert(userData: NewUser): Promise<User> {
    const existingUser = await this.findByEmail(userData.email)

    if (existingUser) {
      return this.update(userData.email, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatarUrl: userData.avatarUrl,
        updatedBy: userData.updatedBy,
      })
    }

    return this.create(userData)
  }
}
