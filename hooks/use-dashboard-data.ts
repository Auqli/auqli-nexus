// app/dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/components/auth/auth-provider"

export interface DashboardData {
  totalOperations: number
  productsProcessed: number
  averageConfidence: number
  pendingTasksCount: number
  uniqueToolsUsed: number
  toolUsage: any[]
  recentActivities: any[]
  dailyOperations: any[]
  memberSince: string | null
  categoryDistribution: { category: string; count: number }[]
  weeklyUsage: any[]
  monthlyUsage: any[]
  timeOfDayUsage: any[]
  userActiveDays: any[]
}

// Default data to show while loading
const defaultData: DashboardData = {
  totalOperations: 0,
  productsProcessed: 0,
  averageConfidence: 0,
  pendingTasksCount: 0,
  uniqueToolsUsed: 0,
  toolUsage: [],
  recentActivities: [],
  dailyOperations: [
    { date: "Apr 10", operations: 0 },
    { date: "Apr 11", operations: 0 },
    { date: "Apr 12", operations: 0 },
    { date: "Apr 13", operations: 0 },
    { date: "Apr 14", operations: 0 },
  ],
  categoryDistribution: [{ category: "Loading...", count: 1 }],
  weeklyUsage: [
    { day_of_week: "Mon", operations: 0 },
    { day_of_week: "Tue", operations: 0 },
    { day_of_week: "Wed", operations: 0 },
    { day_of_week: "Thu", operations: 0 },
    { day_of_week: "Fri", operations: 0 },
    { day_of_week: "Sat", operations: 0 },
    { day_of_week: "Sun", operations: 0 },
  ],
  monthlyUsage: [
    { month: "Jan", operations: 0 },
    { month: "Feb", operations: 0 },
    { month: "Mar", operations: 0 },
    { month: "Apr", operations: 0 },
    { month: "May", operations: 0 },
    { month: "Jun", operations: 0 },
  ],
  timeOfDayUsage: [
    { hour_of_day: "12am-6am", operations: 0 },
    { hour_of_day: "6am-12pm", operations: 0 },
    { hour_of_day: "12pm-6pm", operations: 0 },
    { hour_of_day: "6pm-12am", operations: 0 },
  ],
  userActiveDays: [],
}

export function useDashboardData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>(defaultData)

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fetch basic stats
      const [operationsResult, productsResult, toolsResult, pendingResult] = await Promise.allSettled([
        supabase.from("ai_operations").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("category_mappings").select("id", { count: "exact" }).eq("user_verified", true),
        supabase.from("ai_operations").select("tool_id").eq("user_id", user.id),
        supabase.from("pending_tasks").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "pending"),
      ])

      // Fetch category distribution - avoid using .group()
      const categoryResult = await supabase
        .from("category_mappings")
        .select("main_category")
        .eq("user_id", user.id)
        .not("main_category", "is", null)

      // Process category distribution in JavaScript
      const categoryDistribution: { category: string; count: number }[] = []
      if (categoryResult.data) {
        const categoryMap: Record<string, number> = {}
        categoryResult.data.forEach((item) => {
          const category = item.main_category || "Uncategorized"
          categoryMap[category] = (categoryMap[category] || 0) + 1
        })

        Object.entries(categoryMap).forEach(([category, count]) => {
          categoryDistribution.push({ category, count })
        })

        // Sort by count descending
        categoryDistribution.sort((a, b) => b.count - a.count)
      }

      // Fetch recent activity
      const recentActivityResult = await supabase
        .from("ai_operations")
        .select("id, created_at, tool_id, input_meta")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch daily operations for the last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const dailyOpsResult = await supabase
        .from("ai_operations")
        .select("timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", sevenDaysAgo.toISOString())

      // Process daily operations in JavaScript
      const dailyOperations: { date: string; count: number }[] = []
      if (dailyOpsResult.data) {
        const dailyMap: Record<string, number> = {}
        dailyOpsResult.data.forEach((item) => {
          const dateStr = new Date(item.timestamp).toISOString().split("T")[0]
          dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1
        })

        // Convert to array format
        Object.entries(dailyMap).forEach(([date, count]) => {
          const formattedDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          dailyOperations.push({ date: formattedDate, count })
        })

        // Sort by date ascending
        dailyOperations.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
      }

      // Count unique tools
      const uniqueTools = new Set()
      if (toolsResult.data) {
        toolsResult.data.forEach((item) => {
          if (item.tool_id) uniqueTools.add(item.tool_id)
        })
      }

      setData({
        totalOperations: operationsResult.value.count || 0,
        productsProcessed: productsResult.value.count || 0,
        averageConfidence: 0,
        pendingTasksCount: pendingResult.value.count || 0,
        uniqueToolsUsed: uniqueTools.size,
        toolUsage: [],
        recentActivities: [],
        dailyOperations,
        memberSince: user.created_at || null,
        categoryDistribution,
        weeklyUsage: [],
        monthlyUsage: [],
        timeOfDayUsage: [],
        userActiveDays: [],
      })
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  return { data, loading, error, refetch: fetchDashboardData }
}
