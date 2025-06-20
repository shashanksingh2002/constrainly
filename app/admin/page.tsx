import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export default async function AdminPage() {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect("/auth/signin")
  }

  // In a real app, you'd check if the user has admin privileges
  // For now, any authenticated user can access analytics

  return (
    <div className="container mx-auto py-8">
      <AnalyticsDashboard />
    </div>
  )
}
