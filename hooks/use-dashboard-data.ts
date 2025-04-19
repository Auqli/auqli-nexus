"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
  categoryDistribution: any[]
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
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>(defaultData)

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Simplified data fetching - fetch only essential data first
      const [
        operationsResult,
        productsResult,
        confidenceResult,
        pendingTasksResult,
        toolUsageResult,
        recentActivitiesResult,
      ] = await Promise.allSettled([
        // Total operations
        supabase
          .from("ai_operations")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),

        // Products processed
        supabase
          .from("category_mappings")
          .select("id", { count: "exact" })
          .eq("user_verified", true),

        // Average confidence
        supabase
          .from("category_mappings")
          .select("confidence_score")
          .not("confidence_score", "is", null),

        // Pending tasks
        supabase
          .from("pending_tasks")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "pending"),

        // Tool usage
        supabase
          .from("ai_operations")
          .select("tool_id, ai_tools:tool_id(name, tool_slug)")
          .eq("user_id", user.id),

        // Recent activities
        supabase
          .from("ai_operations")
          .select("id, timestamp, input_meta, ai_tools:tool_id(name)")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(5),
      ])

      // Process results and update state with available data
      const newData = { ...defaultData }

      // Process total operations
      if (operationsResult.status === "fulfilled" && !operationsResult.value.error) {
        newData.totalOperations = operationsResult.value.count || 0
      }

      // Process products processed
      if (productsResult.status === "fulfilled" && !productsResult.value.error) {
        newData.productsProcessed = productsResult.value.count || 0
      }

      // Process average confidence
      if (confidenceResult.status === "fulfilled" && !confidenceResult.value.error) {
        const confidenceData = confidenceResult.value.data
        if (confidenceData && confidenceData.length > 0) {
          const sum = confidenceData.reduce((acc, item) => acc + (item.confidence_score || 0), 0)
          newData.averageConfidence = sum / confidenceData.length
        }
      }

      // Process pending tasks
      if (pendingTasksResult.status === "fulfilled" && !pendingTasksResult.value.error) {
        newData.pendingTasksCount = pendingTasksResult.value.count || 0
      }

      // Process tool usage
      if (toolUsageResult.status === "fulfilled" && !toolUsageResult.value.error) {
        const toolUsageData = toolUsageResult.value.data || []

        // Count unique tools
        const uniqueTools = new Set(toolUsageData.map((item) => item.tool_id))
        newData.uniqueToolsUsed = uniqueTools.size

        // Process tool usage data
        const toolUsageMap = new Map()
        toolUsageData.forEach((item) => {
          if (!toolUsageMap.has(item.tool_id)) {
            toolUsageMap.set(item.tool_id, {
              tool_id: item.tool_id,
              ai_tools: item.ai_tools,
              count: 1,
              max_timestamp: item.timestamp || new Date().toISOString(),
            })
          } else {
            const existing = toolUsageMap.get(item.tool_id)
            existing.count += 1
            if (item.timestamp && (!existing.max_timestamp || item.timestamp > existing.max_timestamp)) {
              existing.max_timestamp = item.timestamp
            }
          }
        })

        newData.toolUsage = Array.from(toolUsageMap.values())
      }

      // Process recent activities
      if (recentActivitiesResult.status === "fulfilled" && !recentActivitiesResult.value.error) {
        const recentActivitiesData = recentActivitiesResult.value.data || []
        newData.recentActivities = recentActivitiesData.map((activity) => ({
          id: activity.id,
          timestamp: activity.timestamp,
          tool_name: activity.ai_tools?.name || "Unknown Tool",
          input_meta: activity.input_meta,
        }))
      }

      // Update state with the data we have so far
      setData(newData)

      // Now fetch the less critical data in the background
      fetchAdditionalData(newData)
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdditionalData = async (currentData: DashboardData) => {
    if (!user) return

    try {
      // Fetch category distribution
      const { data: categoryDistData, error: categoryDistError } = await supabase
        .from("category_mappings")
        .select("main_category, count(*)")
        .group("main_category")

      if (!categoryDistError && categoryDistData) {
        setData((prev) => ({
          ...prev,
          categoryDistribution: categoryDistData.map((item) => ({
            category: item.main_category || "Uncategorized",
            count: Number.parseInt(item.count) || 0,
          })),
        }))
      }

      // Generate weekly usage data
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const weeklyData = weekDays.map((day) => ({ day_of_week: day, operations: 0 }))

      // Fetch operations from the last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: weeklyOpsData, error: weeklyOpsError } = await supabase
        .from("ai_operations")
        .select("timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", sevenDaysAgo.toISOString())

      if (!weeklyOpsError && weeklyOpsData) {
        // Count operations by day of week
        const dayCount: Record<string, number> = {}
        weeklyOpsData.forEach((op) => {
          const day = new Date(op.timestamp).toLocaleDateString("en-US", { weekday: "short" })
          dayCount[day] = (dayCount[day] || 0) + 1
        })

        // Update weekly data
        const updatedWeeklyData = weeklyData.map((item) => ({
          ...item,
          operations: dayCount[item.day_of_week.substring(0, 3)] || 0,
        }))

        setData((prev) => ({ ...prev, weeklyUsage: updatedWeeklyData }))
      }

      // Generate monthly usage data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyData = months.map((month) => ({ month, operations: 0 }))

      // Fetch operations from the last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: monthlyOpsData, error: monthlyOpsError } = await supabase
        .from("ai_operations")
        .select("timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", sixMonthsAgo.toISOString())

      if (!monthlyOpsError && monthlyOpsData) {
        // Count operations by month
        const monthCount: Record<string, number> = {}
        monthlyOpsData.forEach((op) => {
          const month = new Date(op.timestamp).toLocaleDateString("en-US", { month: "short" })
          monthCount[month] = (monthCount[month] || 0) + 1
        })

        // Update monthly data
        const updatedMonthlyData = monthlyData.map((item) => ({
          ...item,
          operations: monthCount[item.month] || 0,
        }))

        setData((prev) => ({ ...prev, monthlyUsage: updatedMonthlyData }))
      }

      // Generate daily operations data
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          operations: 0,
        }
      }).reverse()

      // Fetch operations from the last 14 days
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      const { data: dailyOpsData, error: dailyOpsError } = await supabase
        .from("ai_operations")
        .select("timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", fourteenDaysAgo.toISOString())

      if (!dailyOpsError && dailyOpsData) {
        // Count operations by day
        const dayCount: Record<string, number> = {}
        dailyOpsData.forEach((op) => {
          const day = new Date(op.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          dayCount[day] = (dayCount[day] || 0) + 1
        })

        // Update daily operations data
        const updatedDailyData = last14Days.map((item) => ({
          ...item,
          operations: dayCount[item.date] || 0,
        }))

        setData((prev) => ({ ...prev, dailyOperations: updatedDailyData }))
      }
    } catch (err) {
      console.error("Error fetching additional dashboard data:", err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  return { data, loading, error, refetch: fetchDashboardData }
}
