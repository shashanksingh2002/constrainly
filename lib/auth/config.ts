import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { UserQueries } from "@/lib/db/queries/users"
import { SessionCache } from "@/lib/redis/session-cache"

export const authConfig: NextAuthOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google" && user.email) {
        try {
          const [firstName, ...lastNameParts] = (user.name || "").split(" ")
          const lastName = lastNameParts.join(" ")

          // Upsert user data
          const dbUser = await UserQueries.upsert({
            email: user.email,
            firstName: firstName || "",
            lastName: lastName || "",
            avatarUrl: user.image || "",
            createdBy: user.email,
            updatedBy: user.email,
          })

          // Update last login time
          await UserQueries.updateLastLogin(user.email)

          // Cache user data for faster lookups (with error handling)
          try {
            await SessionCache.setUser(user.email, dbUser)
          } catch (cacheError) {
            console.warn("Failed to cache user data:", cacheError)
            // Continue without caching
          }

          return true
        } catch (error) {
          console.error("Database error during sign in:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }: any) {
      if (session?.user?.email) {
        try {
          // Try cache first, then database
          let user = null

          try {
            user = await SessionCache.getUser(session.user.email)
          } catch (cacheError) {
            console.warn("Cache lookup failed:", cacheError)
          }

          if (!user) {
            user = await UserQueries.findByEmail(session.user.email)
            if (user) {
              // Try to cache for next time (but don't fail if it doesn't work)
              try {
                await SessionCache.setUser(session.user.email, user)
              } catch (cacheError) {
                console.warn("Failed to cache user after DB lookup:", cacheError)
              }
            }
          }

          if (user) {
            session.user.id = user.id.toString()
            session.user.name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email

            // Add last login info to session (optional)
            if (user.lastLoggedInAt) {
              session.lastLoginAt = user.lastLoggedInAt.toISOString()
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Continue with basic session data
        }
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, profile }: any) {
      // This runs after successful sign in
      console.log(`User ${user.email} signed in at ${new Date().toISOString()}`)
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}
