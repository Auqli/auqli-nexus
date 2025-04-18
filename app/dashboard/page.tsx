"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  FileText,
  ImageIcon,
  MessageSquare,
  Scissors,
  Lightbulb,
  FileUp,
  Share2,
  FileTextIcon,
  Zap,
} from "lucide-react"

interface UserProfile {
  name: string | null
  email: string | null
  company_name: string | null
  created_at: string | null
}

interface ToolUsage {
  id: string
  name: string
  icon: React.ReactNode
  usageCount: number
  lastUsed: string | null
  color: string
  path: string
  isAvailable: boolean
}

interface UsageMetric {
  date: string
  count: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for recent activity
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, tool: "CSV Converter", action: "Processed 'products-spring-2023.csv'", timestamp: "2023-04-15T10:30:00Z" },
    { id: 2, tool: "CopyGen AI", action: "Generated 5 product descriptions", timestamp: "2023-04-14T15:45:00Z" },
    {
      id: 3,
      tool: "ImageGen AI",
      action: "Created product visuals for 'Summer Collection'",
      timestamp: "2023-04-13T09:20:00Z",
    },
    {
      id: 4,
      tool: "BlogGen AI",
      action: "Generated blog post 'Top 10 Spring Fashion Trends'",
      timestamp: "2023-04-10T14:15:00Z",
    },
  ])

  // Mock data for usage over time
  const [usageOverTime, setUsageOverTime] = useState<UsageMetric[]>([
    { date: "Apr 1", count: 3 },
    { date: "Apr 5", count: 5 },
    { date: "Apr 10", count: 8 },
    { date: "Apr 15", count: 12 },
    { date: "Apr 20", count: 15 },
  ])

  // Calculate total usage
  const totalUsage = 100 // Mock total usage

  // Mock tool data with new color scheme
  const toolsUsage: ToolUsage[] = [
    {
      id: "csv-converter",
      name: "CSV Converter",
      icon: <FileUp className="h-5 w-5" />,
      usageCount: 12,
      lastUsed: "2023-04-15T10:30:00Z",
      color: "bg-gradient-to-br from-green-400 to-green-600", // Updated color
      path: "/converter",
      isAvailable: true,
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      icon: <FileText className="h-5 w-5" />,
      usageCount: 8,
      lastUsed: "2023-04-14T15:45:00Z",
      color: "bg-gradient-to-br from-blue-400 to-blue-600", // Updated color
      path: "/copygen",
      isAvailable: true,
    },
    {
      id: "imagegen",
      name: "ImageGen AI",
      icon: <ImageIcon className="h-5 w-5" />,
      usageCount: 5,
      lastUsed: "2023-04-13T09:20:00Z",
      color: "bg-gradient-to-br from-purple-400 to-purple-600", // Updated color
      path: "/imagegen",
      isAvailable: true,
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      icon: <MessageSquare className="h-5 w-5" />,
      usageCount: 3,
      lastUsed: "2023-04-10T14:15:00Z",
      color: "bg-gradient-to-br from-pink-400 to-pink-600", // Updated color
      path: "/bloggen",
      isAvailable: true,
    },
    {
      id: "clipslash",
      name: "ClipSlash AI",
      icon: <Scissors className="h-5 w-5" />,
      usageCount: 2,
      lastUsed: "2023-04-08T11:30:00Z",
      color: "bg-gradient-to-br from-orange-400 to-orange-600", // Updated color
      path: "/clipslash",
      isAvailable: false,
    },
    {
      id: "ideaspark",
      name: "IdeaSpark AI",
      icon: <Lightbulb className="h-5 w-5" />,
      usageCount: 1,
      lastUsed: "2023-04-05T16:45:00Z",
      color: "bg-gradient-to-br from-yellow-400 to-yellow-600", // Updated color
      path: "/ideaspark",
      isAvailable: false,
    },
    {
      id: "captiongen",
      name: "CaptionGen AI",
      icon: <MessageSquare className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-teal-400 to-teal-600", // Updated color
      path: "/captiongen",
      isAvailable: false,
    },
    {
      id: "cvboost",
      name: "CVBoost AI",
      icon: <FileTextIcon className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600", // Updated color
      path: "/cvboost",
      isAvailable: false,
    },
    {
      id: "threadgen",
      name: "ThreadGen AI",
      icon: <Share2 className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-red-400 to-red-600", // Updated color
      path: "/threadgen",
      isAvailable: false,
    },
  ]

  // Sort tools by usage count (descending)
  const sortedTools = [...toolsUsage].sort((a, b) => b.usageCount - a.usageCount)

  // Get top 3 most used tools
  const topTools = sortedTools.filter((tool) => tool.usageCount > 0).slice(0, 3)

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

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-[#0f1116]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#0f1116] text-white">
        <Card className="bg-[#1a1d24] border-gray-800">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription className="text-gray-400">You need to be logged in to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#0f1116] text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
          Dashboard
        </h1>
      </div>

      {error && (
        <Card className="mb-6 bg-[#2a1215] border-red-900">
          <CardContent className="pt-6">
            <p className="text-red-400">Error: {error}</p>
            <p className="text-sm text-red-300 mt-2">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[#1e2128] border border-gray-700 rounded-lg p-1 inline-flex">
            <TabsTrigger
              value="overview"
              className="text-gray-300 rounded-md px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4568DC] data-[state=active]:to-[#B06AB3] data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Welcome Card */}
              <Card className="md:col-span-2 lg:col-span-2 bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-100">
                        Welcome, {profile?.name || user.email?.split("@")[0] || "User"}!
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        You've been a member since{" "}
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 rounded-full">
                          <Zap className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-300">Total AI Operations:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">{totalUsage}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Tools Used Card */}
              <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-100">Top Tools Used</CardTitle>
                  <CardDescription className="text-gray-400">Your most frequently used tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topTools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`${tool.color} p-2 rounded-full mr-3`}>{tool.icon}</div>
                        <div>
                          <div className="font-medium text-gray-300">{tool.name}</div>
                          <div className="text-sm text-gray-500">Last used: {formatRelativeTime(tool.lastUsed)}</div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{tool.usageCount} uses</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="md:col-span-2 lg:col-span-2 bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-100">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Your recent actions and tool usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0"
                      >
                        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 rounded-full mr-3">
                          {activity.tool === "CSV Converter" && <FileUp className="h-4 w-4 text-emerald-400" />}
                          {activity.tool === "CopyGen AI" && <FileText className="h-4 w-4 text-blue-400" />}
                          {activity.tool === "ImageGen AI" && <ImageIcon className="h-4 w-4 text-purple-400" />}
                          {activity.tool === "BlogGen AI" && <MessageSquare className="h-4 w-4 text-pink-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-300">{activity.tool}</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
