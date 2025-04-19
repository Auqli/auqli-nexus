"use client"

import { useEffect, useState } from "react"
import { useAIOperations } from "@/hooks/use-ai-operations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PendingTasks() {
  const { getUserPendingTasks, isLoading, error } = useAIOperations()
  const [pendingTasks, setPendingTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getUserPendingTasks()
      setPendingTasks(tasks)
    }

    fetchTasks()

    // Set up polling to check for updates every 5 seconds
    const interval = setInterval(fetchTasks, 5000)

    return () => clearInterval(interval)
  }, [getUserPendingTasks])

  if (isLoading && pendingTasks.length === 0) {
    return <div>Loading pending tasks...</div>
  }

  if (error) {
    return <div>Error loading pending tasks: {error}</div>
  }

  if (pendingTasks.length === 0) {
    return <div>No pending tasks</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{task.task_description}</div>
                <div className="text-sm text-gray-500">Created: {new Date(task.created_at).toLocaleString()}</div>
              </div>
              <Badge
                variant={
                  task.status === "completed"
                    ? "success"
                    : task.status === "failed"
                      ? "destructive"
                      : task.status === "processing"
                        ? "warning"
                        : "default"
                }
              >
                {task.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
