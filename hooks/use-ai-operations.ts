"use client"

import { useCallback, useState } from "react"
import { getBrowserClient } from "@/lib/supabase"
import type { AITool } from "@/types/database"

export function useAIOperations() {
  const supabase = getBrowserClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get all tools
  const getTools = useCallback(
    async (activeOnly = true): Promise<AITool[]> => {
      setIsLoading(true)
      setError(null)

      try {
        let query = supabase.from("ai_tools").select("*")

        if (activeOnly) {
          query = query.eq("is_active", true)
        }

        const { data, error } = await query

        if (error) {
          throw new Error(error.message)
        }

        return data as AITool[]
      } catch (err: any) {
        setError(err.message)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  // Get user's tool usage
  const getUserToolUsage = useCallback(async (): Promise<any[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(userError.message)
      }

      // Since we don't have a view_user_tool_usage view, we'll create a query to get similar data
      const { data, error } = await supabase
        .from("ai_operations")
        .select(`
          tool_id,
          ai_tools:tool_id (name),
          count:tool_id (count),
          max_timestamp:timestamp (max)
        `)
        .eq("user_id", userData.user?.id)
        .group("tool_id, ai_tools!inner(name)")

      if (error) {
        throw new Error(error.message)
      }

      // Transform the data to match the expected format
      return data.map((item) => ({
        tool_name: item.ai_tools?.name,
        usage_count: item.count,
        last_used: item.max_timestamp,
      }))
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Get user's pending tasks
  const getUserPendingTasks = useCallback(async (): Promise<any[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(userError.message)
      }

      const { data, error } = await supabase
        .from("pending_tasks")
        .select("*, ai_operations:operation_id (*)")
        .eq("user_id", userData.user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return {
    getTools,
    getUserToolUsage,
    getUserPendingTasks,
    isLoading,
    error,
  }
}
