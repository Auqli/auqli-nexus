"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBrowserClient } from "@/lib/supabase"

interface PendingTask {
  id: string
  operation_id: string
  status: "pending" | "processing" | "completed" | "failed"
  created_at: string
  updated_at: string
  ai_operations: {
    tool_id: number
    tool: {
      name: string
    }
  }
}

export function PendingTasks() {
  const [tasks, setTasks] = useState<PendingTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getBrowserClient()

  useEffect(() => {
    async function fetchPendingTasks() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          throw new Error("Failed to get current user")
        }

        if (!userData.user) {
          throw new Error("User not authenticated")
        }

        const { data, error } = await supabase
          .from("pending_tasks")
          .select(`
            *,
            ai_operations:operation_id (
              tool_id,
              tool:tool_id (
                name
              )
            )
          `)
          .eq("ai_operations.user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setTasks(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch pending tasks")
        console.error("Error fetching pending tasks:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingTasks()

    // Set up polling to check for updates every 5 seconds
    const interval = setInterval(fetchPendingTasks, 5000)

    return () => clearInterval(interval)
  }, [supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
          <CardDescription>Loading your pending tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
          <CardDescription>There was an error loading your pending tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
        <CardDescription>Your AI tasks in progress</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending tasks found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium">{task.ai_operations?.tool?.name || "Unknown Tool"}</div>
                  <div className="text-sm text-gray-500">Created: {new Date(task.created_at).toLocaleString()}</div>
                </div>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
