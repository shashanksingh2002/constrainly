import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { UserQueries } from "@/lib/db/queries/users"

export const authConfig: NextAuthOptions = {
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

          await UserQueries.upsert({
            email: user.email,
            firstName: firstName || "",
            lastName: lastName || "",
            avatarUrl: user.image || "",
            createdBy: user.email,
            updatedBy: user.email,
          })

          return true
        } catch (error) {
          console.error("Database error during sign in:", error)
          return false
        }
      }
      return true
    },
    async session({ session }) {
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
}
