"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  FileText,
  ImageIcon,
  MessageSquare,
  Scissors,
  Lightbulb,
  Share2,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Mic,
  FileUp,
  FileTextIcon,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface UserProfile {
  name: string | null
  email: string | null
  company_name: string | null
  created_at: string | null
  avatar_url: string | null
}

interface ToolUsage {
  id: string
  name: string
  icon: React.ElementType
  usageCount: number
  lastUsed: string | null
  color: string
  path: string
  isAvailable: boolean
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { data, loading, error } = useDashboardData()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [memberSince, setMemberSince] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Get the appropriate icon for a tool
  const getIconForTool = (toolName: string) => {
    const toolIcons: Record<string, JSX.Element> = {
      "CSV Converter": <FileUp className="h-5 w-5" />,
      "CopyGen AI": <FileText className="h-5 w-5" />,
      "ImageGen AI": <ImageIcon className="h-5 w-5" />,
      "BlogGen AI": <MessageSquare className="h-5 w-5" />,
      "ClipSlash AI": <Scissors className="h-5 w-5" />,
      "IdeaSpark AI": <Lightbulb className="h-5 w-5" />,
      "CaptionGen AI": <MessageSquare className="h-5 w-5" />,
      "VoiceBlog AI": <Mic className="h-5 w-5" />,
      "CVBoost AI": <FileTextIcon className="h-5 w-5" />,
      "ThreadGen AI": <Share2 className="h-5 w-5" />,
    }
    return toolIcons[toolName] || <FileText className="h-5 w-5" />
  }

  // Get the appropriate color for a tool
  const getColorForTool = (toolName: string, index: number) => {
    const toolColors: Record<string, string> = {
      "CSV Converter": "bg-gradient-to-br from-green-400 to-green-600",
      "CopyGen AI": "bg-gradient-to-br from-blue-400 to-blue-600",
      "ImageGen AI": "bg-gradient-to-br from-purple-400 to-purple-600",
      "BlogGen AI": "bg-gradient-to-br from-pink-400 to-pink-600",
      "ClipSlash AI": "bg-gradient-to-br from-orange-400 to-orange-600",
      "IdeaSpark AI": "bg-gradient-to-br from-yellow-400 to-yellow-600",
      "CaptionGen AI": "bg-gradient-to-br from-teal-400 to-teal-600",
      "VoiceBlog AI": "bg-gradient-to-br from-red-400 to-red-600",
      "CVBoost AI": "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "ThreadGen AI": "bg-gradient-to-br from-red-400 to-red-600",
    }

    const fallbackColors = [
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-orange-400 to-orange-600",
      "bg-gradient-to-br from-yellow-400 to-yellow-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
      "bg-gradient-to-br from-red-400 to-red-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-emerald-400 to-emerald-600",
    ]

    return toolColors[toolName] || fallbackColors[index % fallbackColors.length]
  }

  // Transform tool usage data for display
  const transformToolUsage = (): ToolUsage[] => {
    if (!data.toolUsage || data.toolUsage.length === 0) return []

    return data.toolUsage.map((tool, index) => ({
      id: tool.tool_id.toString(),
      name: tool.ai_tools?.name || `Tool ${tool.tool_id}`,
      icon: getIconForTool(tool.ai_tools?.name),
      usageCount: Number.parseInt(tool.count) || 0,
      lastUsed: tool.max_timestamp,
      color: getColorForTool(tool.ai_tools?.name, index),
      path: `/${tool.ai_tools?.tool_slug || ""}`,
      isAvailable: true,
    }))
  }

  // Format tool usage data for charts
  const formatToolUsageForChart = () => {
    const toolUsage = transformToolUsage()
    return toolUsage
      .filter((tool) => tool.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map((tool) => ({
        name: tool.name,
        value: tool.usageCount,
      }))
  }

  // Format recent activities for display
  const formatRecentActivities = () => {
    if (!data.recentActivities || data.recentActivities.length === 0) return []

    return data.recentActivities.map((activity) => {
      // Extract action from input_meta if available
      let action = "Used tool"
      if (activity.input_meta) {
        if (activity.tool_name === "CSV Converter" && activity.input_meta.csvData) {
          action = `Processed CSV data (${activity.input_meta.csvData.substring(0, 20)}...)`
        } else if (activity.tool_name === "CopyGen AI" && activity.input_meta.prompt) {
          action = `Generated content: "${activity.input_meta.prompt.substring(0, 30)}..."`
        } else if (activity.tool_name === "ImageGen AI" && activity.input_meta.prompt) {
          action = `Created image: "${activity.input_meta.prompt.substring(0, 30)}..."`
        } else if (activity.tool_name === "BlogGen AI" && activity.input_meta.topic) {
          action = `Generated blog post about "${activity.input_meta.topic}"`
        }
      }

      return {
        id: activity.id,
        tool: activity.tool_name,
        action,
        timestamp: activity.timestamp,
      }
    })
  }

  // Format category distribution for chart
  const formatCategoryDistribution = () => {
    if (!data.categoryDistribution || data.categoryDistribution.length === 0) {
      return [{ name: "No Data", value: 1 }]
    }

    return data.categoryDistribution.map((category) => ({
      name: category.category || "Uncategorized",
      value: Number.parseInt(category.count) || 0,
    }))
  }

  // Format weekly usage for chart
  const formatWeeklyUsage = () => {
    if (!data.weeklyUsage || data.weeklyUsage.length === 0) {
      return [
        { date: "Mon", count: 0 },
        { date: "Tue", count: 0 },
        { date: "Wed", count: 0 },
        { date: "Thu", count: 0 },
        { date: "Fri", count: 0 },
        { date: "Sat", count: 0 },
        { date: "Sun", count: 0 },
      ]
    }

    return data.weeklyUsage.map((day) => ({
      date: day.day_of_week,
      count: Number.parseInt(day.operations) || 0,
    }))
  }

  // Format monthly usage for chart
  const formatMonthlyUsage = () => {
    if (!data.monthlyUsage || data.monthlyUsage.length === 0) {
      return [
        { date: "Jan", count: 0 },
        { date: "Feb", count: 0 },
        { date: "Mar", count: 0 },
        { date: "Apr", count: 0 },
        { date: "May", count: 0 },
        { date: "Jun", count: 0 },
      ]
    }

    return data.monthlyUsage.map((month) => ({
      date: month.month,
      count: Number.parseInt(month.operations) || 0,
    }))
  }

  // Format time of day usage for chart
  const formatTimeOfDayUsage = () => {
    if (!data.timeOfDayUsage || data.timeOfDayUsage.length === 0) {
      return [
        { time: "12am", operations: 0 },
        { time: "6am", operations: 0 },
        { time: "12pm", operations: 0 },
        { time: "6pm", operations: 0 },
      ]
    }

    return data.timeOfDayUsage.map((hour) => ({
      time: hour.hour_of_day,
      operations: Number.parseInt(hour.operations) || 0,
    }))
  }

  // Format user active days for chart
  const formatUserActiveDays = () => {
    if (!data.userActiveDays || data.userActiveDays.length === 0) return []

    return data.userActiveDays.map((day) => ({
      name: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
      active: day.is_active ? 1 : 0,
      inactive: day.is_active ? 0 : 1,
    }))
  }

  // Format date to relative time
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

  // Load user profile
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        company_name: user.user_metadata?.company_name || null,
        created_at: user.created_at,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
    }
  }, [user])

  // Load member since date
  useEffect(() => {
    if (user && user.id) {
      const fetchMemberSince = async () => {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("created_at")
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error fetching member since date:", error)
        } else if (data) {
          setMemberSince(data.created_at)
        }
      }

      fetchMemberSince()
    }
  }, [user, supabase])

  // Prepare data for rendering
  const toolsUsage = transformToolUsage()
  const sortedTools = [...toolsUsage].sort((a, b) => b.usageCount - a.usageCount)
  const topTools = sortedTools.filter((tool) => tool.usageCount > 0).slice(0, 3)
  const toolUsageData = formatToolUsageForChart()
  const recentActivities = formatRecentActivities()
  const categoryDistribution = formatCategoryDistribution()
  const weeklyUsage = formatWeeklyUsage()
  const monthlyUsage = formatMonthlyUsage()
  const timeOfDayData = formatTimeOfDayUsage()
  const userActivityData = formatUserActiveDays()
  const dailyOperationsData = data.dailyOperations.map((item) => ({
    date:
      typeof item.date === "string"
        ? item.date
        : new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    operations: Number.parseInt(item.operations) || 0,
  }))

  // Chart colors
  const COLORS = ["#16783a", "#45c133", "#8696ee", "#5466b5", "#f59e0b", "#ec4899"]

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

      {/* Tabs at the top */}
      <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="bg-[#1e2128] border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Key Metrics Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total AI Operations</p>
                    <h3 className="text-2xl font-bold mt-1 text-white">
                      {loading ? <span className="animate-pulse">...</span> : data.totalOperations}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-full">
                    <Zap className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Products Processed</p>
                    <h3 className="text-2xl font-bold mt-1 text-white">
                      {loading ? <span className="animate-pulse">...</span> : data.productsProcessed}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-full">
                    <FileUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Tools Used</p>
                    <h3 className="text-2xl font-bold mt-1 text-white">
                      {loading ? <span className="animate-pulse">...</span> : data.uniqueToolsUsed}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400">BlogGen Scheduled Tasks</p>
                    <h3 className="text-2xl font-bold mt-1 text-white">
                      {loading ? <span className="animate-pulse">...</span> : data.pendingTasksCount}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Welcome Card and Top Tools */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* Enhanced Welcome Card */}
            <Card className="md:col-span-2 bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-emerald-500">
                      <AvatarImage
                        src={profile?.avatar_url || `/placeholder.svg?height=64&width=64&query=user avatar`}
                        alt={profile?.name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-600 text-white text-xl">
                        {profile?.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-100">
                        Welcome, {profile?.name || user.email?.split("@")[0] || "User"}!
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {profile?.company_name ? `${profile.company_name} • ` : ""}
                        Member since{" "}
                        {memberSince ? new Date(memberSince).toLocaleDateString() : new Date().toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Your AI Usage Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Total Operations</span>
                        <span className="text-white font-medium">
                          {loading ? <span className="animate-pulse">...</span> : data.totalOperations}
                        </span>
                      </div>
                      <Progress
                        value={(data.totalOperations / 5000) * 100}
                        className="h-2 bg-gray-700"
                        indicatorClassName="bg-gradient-to-r from-emerald-500 to-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        You've used {((data.totalOperations / 5000) * 100).toFixed(1)}% of your monthly quota (5,000
                        operations)
                      </p>
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
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center">
                        <div className="bg-gray-700 p-2 rounded-full mr-3 h-9 w-9"></div>
                        <div>
                          <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-800 rounded w-16"></div>
                        </div>
                      </div>
                      <span className="h-4 bg-gray-700 rounded w-12"></span>
                    </div>
                    <div className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center">
                        <div className="bg-gray-700 p-2 rounded-full mr-3 h-9 w-9"></div>
                        <div>
                          <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-800 rounded w-16"></div>
                        </div>
                      </div>
                      <span className="h-4 bg-gray-700 rounded w-12"></span>
                    </div>
                  </div>
                ) : topTools.length > 0 ? (
                  topTools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`${tool.color} p-2 rounded-full mr-3`}>{tool.icon}</div>
                        <div>
                          <div className="font-medium text-gray-300">{tool.name}</div>
                          <div className="text-xs text-gray-500">Last used: {formatRelativeTime(tool.lastUsed)}</div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-400">{tool.usageCount} uses</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>No tools used yet</p>
                    <p className="text-xs mt-2">Try out our AI tools to see them here!</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white w-full justify-center"
                  onClick={() => router.push("/")}
                >
                  Explore Tools
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity and Tool Usage Chart */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Recent Activity Card */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-100">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">Your recent actions and tool usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="flex items-start pb-4 border-b border-gray-800 animate-pulse">
                        <div className="bg-gray-700 p-2 rounded-full mr-3 h-9 w-9"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-800 rounded w-16"></div>
                          </div>
                          <div className="h-3 bg-gray-800 rounded w-full mt-2"></div>
                        </div>
                      </div>
                      <div className="flex items-start pb-4 border-b border-gray-800 animate-pulse">
                        <div className="bg-gray-700 p-2 rounded-full mr-3 h-9 w-9"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-800 rounded w-16"></div>
                          </div>
                          <div className="h-3 bg-gray-800 rounded w-full mt-2"></div>
                        </div>
                      </div>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0"
                      >
                        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-2 rounded-full mr-3">
                          {getIconForTool(activity.tool)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-300">{activity.tool}</h3>
                            <span className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-400">{activity.action}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <p>No recent activity</p>
                      <p className="text-xs mt-2">Your recent tool usage will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tool Usage Chart */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-100">Tool Usage</CardTitle>
                  <CardDescription className="text-gray-400">Distribution of your tool usage</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                  ) : toolUsageData && toolUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={toolUsageData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis type="category" dataKey="name" width={100} stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                          itemStyle={{ color: "white" }}
                        />
                        <Bar dataKey="value" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#10b981" />
                            <stop offset="95%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <p>No tool usage data available</p>
                        <p className="text-xs mt-2">Use AI tools to see usage statistics</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
