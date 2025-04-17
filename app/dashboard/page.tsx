"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

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
          .maybeSingle() // Use maybeSingle instead of single to avoid errors

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
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

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">My Tools</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Quick steps to make the most of Auqli AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Explore our AI tools</h3>
                      <p className="text-sm text-gray-500">
                        Check out our suite of AI tools designed to help with product categorization and content
                        generation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Upload your first CSV</h3>
                      <p className="text-sm text-gray-500">
                        Use our CSV Converter to prepare your product data for categorization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Generate your first AI content</h3>
                      <p className="text-sm text-gray-500">
                        Try CopyGen AI to create compelling product descriptions or ImageGen AI for product visuals.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>My Tools</CardTitle>
              <CardDescription>Tools you've recently used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-emerald-500 rounded-full p-2 w-fit mb-3">
                    <div className="w-4 h-4"></div>
                  </div>
                  <h3 className="font-medium">CSV Converter</h3>
                  <p className="text-sm text-gray-500 mt-1">Convert and prepare product CSVs for bulk uploads</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => router.push("/converter")}>
                    Launch
                  </Button>
                </div>

                <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-blue-500 rounded-full p-2 w-fit mb-3">
                    <div className="w-4 h-4"></div>
                  </div>
                  <h3 className="font-medium">CopyGen AI</h3>
                  <p className="text-sm text-gray-500 mt-1">Create powerful product titles and descriptions</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Launch
                  </Button>
                </div>

                <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-purple-500 rounded-full p-2 w-fit mb-3">
                    <div className="w-4 h-4"></div>
                  </div>
                  <h3 className="font-medium">ImageGen AI</h3>
                  <p className="text-sm text-gray-500 mt-1">Generate high-quality product photos and visuals</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Launch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 italic">Account settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
