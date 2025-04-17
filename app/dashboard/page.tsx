"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useRouter } from "next/navigation"

interface UserProfile {
  name: string | null
  email: string | null
  company_name: string | null
  created_at: string | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Try to fetch the profile
        const { data, error } = await supabase
          .from("user_profiles")
          .select("name, email, company_name, created_at")
          .eq("user_id", user.id)
          .maybeSingle()

        if (error) {
          console.error("Error fetching profile:", error)
          setError(error.message)
        } else {
          // Profile found or null
          setProfile(
            data || {
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
              email: user.email,
              company_name: user.user_metadata?.company_name || null,
              created_at: new Date().toISOString(),
            },
          )
        }
      } catch (err: any) {
        console.error("Unexpected error:", err)
        setError(err.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your Auqli AI dashboard</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Error: {error}</p>
            <p className="text-sm text-red-600 mt-2">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.name || user.email?.split("@")[0] || "User"}!</CardTitle>
            <CardDescription>
              You've been a member since{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {profile?.email || user.email || "Not available"}
              </p>
              {profile?.company_name && (
                <p>
                  <strong>Company:</strong> {profile.company_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and tool usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 italic">No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Launch your favorite tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="bg-emerald-500 rounded-full p-2 w-fit mb-3">
                  <div className="w-4 h-4"></div>
                </div>
                <h3 className="font-medium">CSV Converter</h3>
                <p className="text-sm text-gray-500 mt-1">Convert and prepare product CSVs</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => router.push("/tools/csv-converter")}
                >
                  Launch
                </Button>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="bg-blue-500 rounded-full p-2 w-fit mb-3">
                  <div className="w-4 h-4"></div>
                </div>
                <h3 className="font-medium">CopyGen AI</h3>
                <p className="text-sm text-gray-500 mt-1">Create product titles and descriptions</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => router.push("/tools/copy-gen")}
                >
                  Launch
                </Button>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="bg-purple-500 rounded-full p-2 w-fit mb-3">
                  <div className="w-4 h-4"></div>
                </div>
                <h3 className="font-medium">ImageGen AI</h3>
                <p className="text-sm text-gray-500 mt-1">Generate product photos and visuals</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => router.push("/tools/image-gen")}
                >
                  Launch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
