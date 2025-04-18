"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  PieChartIcon,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

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

interface KeyMetric {
  name: string
  value: number | string
  icon: React.ReactNode
  description: string
  change: number
  color: string
}

interface CommonPrompt {
  tool: string
  prompts: string[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for key metrics
  const keyMetrics: KeyMetric[] = [
    {
      name: "Total AI Operations",
      value: 143,
      icon: <Zap className="h-5 w-5" />,
      description: "Total AI operations performed",
      change: 12,
      color: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    },
    {
      name: "Products Processed",
      value: 87,
      icon: <FileUp className="h-5 w-5" />,
      description: "Total products processed",
      change: 8,
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      name: "Avg. Confidence",
      value: "92%",
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Average AI confidence score",
      change: 3,
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      name: "Pending Tasks",
      value: 5,
      icon: <AlertCircle className="h-5 w-5" />,
      description: "Tasks awaiting completion",
      change: -2,
      color: "bg-gradient-to-br from-amber-400 to-amber-600",
    },
  ]

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

  // Mock data for weekly usage trends
  const weeklyUsage: UsageMetric[] = [
    { date: "Mon", count: 5 },
    { date: "Tue", count: 8 },
    { date: "Wed", count: 12 },
    { date: "Thu", count: 7 },
    { date: "Fri", count: 15 },
    { date: "Sat", count: 6 },
    { date: "Sun", count: 3 },
  ]

  // Mock data for monthly usage trends
  const monthlyUsage: UsageMetric[] = [
    { date: "Jan", count: 30 },
    { date: "Feb", count: 45 },
    { date: "Mar", count: 60 },
    { date: "Apr", count: 75 },
    { date: "May", count: 90 },
    { date: "Jun", count: 105 },
  ]

  // Calculate total usage
  const totalUsage = keyMetrics[0].value

  // Mock tool data with new color scheme
  const toolsUsage: ToolUsage[] = [
    {
      id: "csv-converter",
      name: "CSV Converter",
      icon: <FileUp className="h-5 w-5" />,
      usageCount: 32,
      lastUsed: "2023-04-15T10:30:00Z",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      path: "/converter",
      isAvailable: true,
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      icon: <FileText className="h-5 w-5" />,
      usageCount: 28,
      lastUsed: "2023-04-14T15:45:00Z",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      path: "/copygen",
      isAvailable: true,
    },
    {
      id: "imagegen",
      name: "ImageGen AI",
      icon: <ImageIcon className="h-5 w-5" />,
      usageCount: 25,
      lastUsed: "2023-04-13T09:20:00Z",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      path: "/imagegen",
      isAvailable: true,
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      icon: <MessageSquare className="h-5 w-5" />,
      usageCount: 18,
      lastUsed: "2023-04-10T14:15:00Z",
      color: "bg-gradient-to-br from-pink-400 to-pink-600",
      path: "/bloggen",
      isAvailable: true,
    },
    {
      id: "clipslash",
      name: "ClipSlash AI",
      icon: <Scissors className="h-5 w-5" />,
      usageCount: 12,
      lastUsed: "2023-04-08T11:30:00Z",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
      path: "/clipslash",
      isAvailable: false,
    },
    {
      id: "ideaspark",
      name: "IdeaSpark AI",
      icon: <Lightbulb className="h-5 w-5" />,
      usageCount: 8,
      lastUsed: "2023-04-05T16:45:00Z",
      color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      path: "/ideaspark",
      isAvailable: false,
    },
    {
      id: "captiongen",
      name: "CaptionGen AI",
      icon: <MessageSquare className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-teal-400 to-teal-600",
      path: "/captiongen",
      isAvailable: false,
    },
    {
      id: "cvboost",
      name: "CVBoost AI",
      icon: <FileTextIcon className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      path: "/cvboost",
      isAvailable: false,
    },
    {
      id: "threadgen",
      name: "ThreadGen AI",
      icon: <Share2 className="h-5 w-5" />,
      usageCount: 0,
      lastUsed: null,
      color: "bg-gradient-to-br from-red-400 to-red-600",
      path: "/threadgen",
      isAvailable: false,
    },
  ]

  // Tool usage data for chart
  const toolUsageData = toolsUsage
    .filter((tool) => tool.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map((tool) => ({
      name: tool.name,
      value: tool.usageCount,
    }))

  // Sort tools by usage count (descending)
  const sortedTools = [...toolsUsage].sort((a, b) => b.usageCount - a.usageCount)

  // Get top 3 most used tools
  const topTools = sortedTools.filter((tool) => tool.usageCount > 0).slice(0, 3)

  // Category distribution data
  const categoryDistribution = [
    { name: "Fashion", value: 30 },
    { name: "Electronics", value: 25 },
    { name: "Home & Living", value: 20 },
    { name: "Health & Beauty", value: 15 },
    { name: "Sports & Outdoors", value: 10 },
  ]

  // Most used prompts
  const commonPrompts: CommonPrompt[] = [
    {
      tool: "CopyGen AI",
      prompts: [
        "Write a product description for [product name]",
        "Create a catchy headline for [product]",
        "Generate 5 social media captions for [product]",
      ],
    },
    {
      tool: "BlogGen AI",
      prompts: [
        "Write a blog post about [topic]",
        "Create a listicle of top 10 [category] trends",
        "Generate an SEO-optimized article about [topic]",
      ],
    },
    {
      tool: "ImageGen AI",
      prompts: [
        "Create a product image for [product] on white background",
        "Generate lifestyle images for [product]",
        "Design a banner for [campaign]",
      ],
    },
  ]

  const COLORS = ["#16783a", "#45c133", "#8696ee", "#5466b5", "#f59e0b", "#ec4899"]

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
          .select("name, email, company_name, created_at, avatar_url")
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
              avatar_url: null,
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
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Key Metrics Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {keyMetrics.map((metric, index) => (
              <Card key={index} className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{metric.name}</p>
                      <h3 className="text-2xl font-bold mt-1 text-white">{metric.value}</h3>
                    </div>
                    <div className={`${metric.color} p-2 rounded-full`}>{metric.icon}</div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <span className={metric.change > 0 ? "text-green-400" : "text-red-400"}>
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}% from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : new Date().toLocaleDateString()}
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
                        <span className="text-white font-medium">{totalUsage}</span>
                      </div>
                      <Progress
                        value={75}
                        className="h-2 bg-gray-700"
                        indicatorClassName="bg-gradient-to-r from-emerald-500 to-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">You've used 75% of your monthly quota</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Activity Summary</h3>
                    <p className="text-sm text-gray-300">
                      You've processed {keyMetrics[1].value} products this month and generated content with an average
                      confidence score of {keyMetrics[2].value}.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4">
                <Button
                  variant="outline"
                  className="text-emerald-400 border-emerald-400 hover:bg-emerald-400/10"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>

            {/* Top Tools Used Card */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-100">Top Tools Used</CardTitle>
                <CardDescription className="text-gray-400">Your most frequently used tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topTools.map((tool) => (
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
                ))}
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white w-full justify-center"
                  onClick={() => setActiveTab("tools")}
                >
                  View All Tools
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

            {/* Tool Usage Chart */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-100">Tool Usage</CardTitle>
                <CardDescription className="text-gray-400">Distribution of your tool usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={toolUsageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                        itemStyle={{ color: "white" }}
                      />
                      <Bar dataKey="value" name="Usage Count" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution and Weekly/Monthly Trends */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Category Distribution Pie Chart */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-100">Category Distribution</CardTitle>
                  <CardDescription className="text-gray-400">Distribution of product categories</CardDescription>
                </div>
                <PieChartIcon className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                        itemStyle={{ color: "white" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly & Monthly Usage Trends */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-100">Usage Trends</CardTitle>
                  <CardDescription className="text-gray-400">Weekly and monthly AI usage</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="weekly" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#282c34]">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="weekly" className="mt-4">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyUsage}>
                          <defs>
                            <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                            itemStyle={{ color: "white" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorWeekly)"
                            name="AI Operations"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-4">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyUsage}>
                          <defs>
                            <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                            itemStyle={{ color: "white" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorMonthly)"
                            name="AI Operations"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Most Used Prompts */}
          <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-100">Most Used Prompts</CardTitle>
              <CardDescription className="text-gray-400">Common prompts for each tool</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Tool</TableHead>
                    <TableHead className="text-gray-300">Common Prompts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commonPrompts.map((item, index) => (
                    <TableRow key={index} className="border-gray-800">
                      <TableCell className="font-medium text-white">{item.tool}</TableCell>
                      <TableCell className="text-gray-300">
                        <ul className="list-disc pl-5 space-y-1">
                          {item.prompts.map((prompt, idx) => (
                            <li key={idx} className="text-sm">
                              {prompt}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {toolsUsage.map((tool) => (
              <Card key={tool.id} className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`${tool.color} p-2 rounded-full`}>{tool.icon}</div>
                      <CardTitle className="text-lg font-bold text-gray-100">{tool.name}</CardTitle>
                    </div>
                    {!tool.isAvailable && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Coming Soon</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Usage</span>
                      <span className="text-gray-300">{tool.usageCount} operations</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Used</span>
                      <span className="text-gray-300">{formatRelativeTime(tool.lastUsed)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-800 pt-4">
                  <Button
                    className="w-full"
                    variant={tool.isAvailable ? "default" : "outline"}
                    disabled={!tool.isAvailable}
                    onClick={() => router.push(tool.path)}
                  >
                    {tool.isAvailable ? "Launch Tool" : "Coming Soon"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Weekly & Monthly Usage Trends (Full Width) */}
            <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-100">Usage Analytics</CardTitle>
                <CardDescription className="text-gray-400">Detailed view of your AI usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        ...monthlyUsage,
                        ...monthlyUsage.map((item) => ({ ...item, date: item.date + " '23", count: item.count * 0.7 })),
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                        itemStyle={{ color: "white" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="2024" stroke="#10b981" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="count" name="2023" stroke="#6b7280" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tool Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-100">Tool Performance</CardTitle>
                  <CardDescription className="text-gray-400">Average confidence scores by tool</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topTools.map((tool) => ({ name: tool.name, score: Math.floor(Math.random() * 15) + 80 }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                          itemStyle={{ color: "white" }}
                        />
                        <Bar dataKey="score" name="Confidence Score" fill="#8696ee" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1e2128] border-gray-700 rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-100">Usage by Time of Day</CardTitle>
                  <CardDescription className="text-gray-400">When you use AI tools the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { time: "12am", count: 2 },
                          { time: "3am", count: 0 },
                          { time: "6am", count: 3 },
                          { time: "9am", count: 15 },
                          { time: "12pm", count: 12 },
                          { time: "3pm", count: 22 },
                          { time: "6pm", count: 18 },
                          { time: "9pm", count: 10 },
                        ]}
                      >
                        <defs>
                          <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8696ee" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8696ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e2128", borderColor: "#374151", color: "white" }}
                          itemStyle={{ color: "white" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#8696ee"
                          fillOpacity={1}
                          fill="url(#colorTime)"
                          name="Operations"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
