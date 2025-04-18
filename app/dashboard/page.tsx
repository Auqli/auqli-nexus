"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Clock,
  Zap,
  Share2,
  FileTextIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

  // Complete list of all tools
  const [toolsUsage, setToolsUsage] = useState<ToolUsage[]>([
    {
      id: "csv-converter",
      name: "CSV Converter",
      icon: <FileUp className="h-5 w-5" />,
      usageCount: 12,
      lastUsed: "2023-04-15T10:30:00Z",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      path: "/converter",
      isAvailable: true,
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      icon: <FileText className="h-5 w-5" />,
      usageCount: 8,
      lastUsed: "2023-04-14T15:45:00Z",
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      path: "/copygen",
      isAvailable: true,
    },
    {
      id: "imagegen",
      name: "ImageGen AI",
      icon: <ImageIcon className="h-5 w-5" />,
      usageCount: 5,
      lastUsed: "2023-04-13T09:20:00Z",
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
      path: "/imagegen",
      isAvailable: true,
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      icon: <MessageSquare className="h-5 w-5" />,
      usageCount: 3,
      lastUsed: "2023-04-10T14:15:00Z",
      color: "bg-gradient-to-br from-pink-500 to-pink-700",
      path: "/bloggen",
      isAvailable: true,
    },
    {
      id: "clipslash",
      name: "ClipSlash AI",
      icon: <Scissors className="h-5 w-5" />,
      usageCount: 2,
      lastUsed: "2023-04-08T11:30:00Z",
      color: "bg-gradient-to-br from-orange-500 to-orange-700",
      path: "/clipslash",
      isAvailable: false,
    },
    {
      id: "ideaspark",
      name: "IdeaSpark AI",
      icon: <Lightbulb className="h-5 w-5" />,
      usageCount: 1,
      lastUsed: "2023-04-05T16:45:00Z",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-700",
      path: "/ideaspark",
      isAvailable: false,
    },
    {
      id: "captiongen",
      name: "CaptionGen AI",
      icon: <MessageSquare className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-teal-500 to-teal-700",
      path: "/captiongen",
      isAvailable: false,
    },
    {
      id: "cvboost",
      name: "CVBoost AI",
      icon: <FileTextIcon className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      path: "/cvboost",
      isAvailable: false,
    },
    {
      id: "threadgen",
      name: "ThreadGen AI",
      icon: <Share2 className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-red-500 to-red-700",
      path: "/threadgen",
      isAvailable: false,
    },
  ])

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
  const totalUsage = toolsUsage.reduce((sum, tool) => sum + tool.usageCount, 0)

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

      <div className="mb-6 bg-gradient-to-r from-[#1a1d24]/80 to-[#1a1d24]/30 p-1 rounded-lg inline-block">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[#0f1116]/50 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
            >
              My Tools
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Welcome Card */}
              <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                        Welcome, {profile?.name || user.email?.split("@")[0] || "User"}!
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        You've been a member since{" "}
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 bg-[#1e2128] border-gray-700">
                      <Clock className="w-3 h-3 mr-1 text-emerald-400" />
                      Last login: Today
                    </Badge>
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
                        <Badge className="bg-green-900/50 text-green-400 hover:bg-green-900/50 border-green-700">
                          +15% this week
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">Usage Quota</span>
                        <span className="text-sm font-medium text-gray-300">65% used</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Top Tools</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {topTools.map((tool) => (
                          <div
                            key={tool.id}
                            className="flex flex-col items-center p-3 bg-[#1e2128] rounded-lg border border-gray-800"
                          >
                            <div className={`${tool.color} p-2 rounded-full mb-2`}>{tool.icon}</div>
                            <span className="text-xs font-medium text-center text-gray-300">{tool.name}</span>
                            <span className="text-xs text-gray-500">{tool.usageCount} uses</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400">Frequently used tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#1e2128] border-gray-700 hover:bg-gray-800 hover:text-emerald-400"
                    onClick={() => router.push("/converter")}
                  >
                    <FileUp className="mr-2 h-4 w-4 text-emerald-400" />
                    Upload CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#1e2128] border-gray-700 hover:bg-gray-800 hover:text-blue-400"
                    onClick={() => router.push("/copygen")}
                  >
                    <FileText className="mr-2 h-4 w-4 text-blue-400" />
                    Generate Copy
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#1e2128] border-gray-700 hover:bg-gray-800 hover:text-purple-400"
                    onClick={() => router.push("/imagegen")}
                  >
                    <ImageIcon className="mr-2 h-4 w-4 text-purple-400" />
                    Create Images
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#1e2128] border-gray-700 hover:bg-gray-800 hover:text-pink-400"
                    onClick={() => router.push("/bloggen")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 text-pink-400" />
                    Write Blog
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Your recent actions and tool usage</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
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
                              <span className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-400">{activity.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No recent activity to display.</p>
                  )}
                </CardContent>
              </Card>

              {/* Usage Stats Card */}
              <Card className="bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Usage Stats</CardTitle>
                  <CardDescription className="text-gray-400">Tool usage breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedTools.slice(0, 4).map((tool) => (
                      <div key={tool.id} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-300">{tool.name}</span>
                          <span className="text-sm text-gray-400">{tool.usageCount} uses</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                            style={{ width: `${(tool.usageCount / totalUsage) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Getting Started Card */}
              <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Getting Started</CardTitle>
                  <CardDescription className="text-gray-400">Quick steps to make the most of Auqli AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-[#1e2128] rounded-lg p-4 border border-gray-800">
                      <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 rounded-full w-fit mb-3">
                        <span className="text-emerald-400 font-bold">1</span>
                      </div>
                      <h3 className="font-medium text-gray-300">Explore our AI tools</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Check out our suite of AI tools designed to help with product categorization and content
                        generation.
                      </p>
                      <Button variant="link" className="px-0 mt-2 text-emerald-400" size="sm">
                        Browse tools
                      </Button>
                    </div>

                    <div className="bg-[#1e2128] rounded-lg p-4 border border-gray-800">
                      <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 rounded-full w-fit mb-3">
                        <span className="text-emerald-400 font-bold">2</span>
                      </div>
                      <h3 className="font-medium text-gray-300">Upload your first CSV</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Use our CSV Converter to prepare your product data for categorization.
                      </p>
                      <Button
                        variant="link"
                        className="px-0 mt-2 text-emerald-400"
                        size="sm"
                        onClick={() => router.push("/converter")}
                      >
                        Try CSV Converter
                      </Button>
                    </div>

                    <div className="bg-[#1e2128] rounded-lg p-4 border border-gray-800">
                      <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 rounded-full w-fit mb-3">
                        <span className="text-emerald-400 font-bold">3</span>
                      </div>
                      <h3 className="font-medium text-gray-300">Generate your first AI content</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Try CopyGen AI to create compelling product descriptions or ImageGen AI for product visuals.
                      </p>
                      <Button
                        variant="link"
                        className="px-0 mt-2 text-emerald-400"
                        size="sm"
                        onClick={() => router.push("/copygen")}
                      >
                        Start creating
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <Card className="bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">My Tools</CardTitle>
                <CardDescription className="text-gray-400">All available AI tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {toolsUsage.map((tool) => (
                    <div
                      key={tool.id}
                      className="bg-[#1e2128] border border-gray-800 rounded-lg p-4 hover:shadow-md hover:shadow-emerald-900/10 transition-shadow"
                    >
                      <div className={`${tool.color} rounded-full p-2 w-fit mb-3`}>{tool.icon}</div>
                      <h3 className="font-medium text-gray-300">{tool.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Last used: {tool.lastUsed ? formatRelativeTime(tool.lastUsed) : "Never"}
                      </p>
                      <div className="flex items-center mt-2 mb-3">
                        <span className="text-sm font-medium mr-2 text-gray-400">Usage: {tool.usageCount}</span>
                        {tool.usageCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-900/30 text-emerald-400 border-emerald-800"
                          >
                            Active
                          </Badge>
                        )}
                        {!tool.isAvailable && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-800 text-gray-400 border-gray-700 ml-auto"
                          >
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-[#1a1d24] border-gray-700 hover:bg-gray-800 hover:text-emerald-400"
                        onClick={() => router.push(tool.path)}
                        disabled={!tool.isAvailable}
                      >
                        Launch
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Usage Analytics</CardTitle>
                <CardDescription className="text-gray-400">Detailed insights into your tool usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-300">Usage Over Time</h3>
                    <div className="h-64 bg-[#1e2128] rounded-lg flex items-end justify-between p-4 border border-gray-800">
                      {usageOverTime.map((metric, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-gradient-to-t from-emerald-500 to-blue-500 w-12 rounded-t-md"
                            style={{ height: `${(metric.count / 15) * 100}%` }}
                          ></div>
                          <span className="text-xs mt-2 text-gray-400">{metric.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-300">Tool Distribution</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {toolsUsage.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center p-3 bg-[#1e2128] rounded-lg border border-gray-800"
                        >
                          <div className={`${tool.color} p-2 rounded-full mr-3`}>{tool.icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-300">{tool.name}</span>
                              <span className="text-sm text-gray-400">{tool.usageCount} uses</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                                style={{ width: `${(tool.usageCount / totalUsage) * 100 || 1}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-gradient-to-br from-[#1a1d24] to-[#1a1d24]/80 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium text-gray-300">Profile Information</h3>
                    <div className="grid gap-1">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-300">{profile?.name || "Not set"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-300">{profile?.email || user.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-500">Company</span>
                        <span className="font-medium text-gray-300">{profile?.company_name || "Not set"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Member Since</span>
                        <span className="font-medium text-gray-300">
                          {profile?.created_at
                            ? new Date(profile.created_at).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1e2128] border-gray-700 hover:bg-gray-800 hover:text-emerald-400"
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
