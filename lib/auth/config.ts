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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const [firstName, ...lastNameParts] = (user.name || "").split(" ")
          const lastName = lastNameParts.join(" ")

          const dbUser = await UserQueries.upsert({
            email: user.email,
            firstName: firstName || "",
            lastName: lastName || "",
            avatarUrl: user.image || "",
            createdBy: user.email,
            updatedBy: user.email,
          })

          // Cache user data for faster lookups
          await SessionCache.setUser(user.email, dbUser)

          return true
        } catch (error) {
          console.error("Database error during sign in:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          // Try cache first, then database
          let user = await SessionCache.getUser(session.user.email)

          if (!user) {
            user = await UserQueries.findByEmail(session.user.email)
            if (user) {
              // Cache for next time
              await SessionCache.setUser(session.user.email, user)
            }
          }

          if (user) {
            session.user.id = user.id
            session.user.name = `${user.firstName} ${user.lastName}`.trim()
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
      return session
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
