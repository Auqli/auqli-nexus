"use client"

import { useEffect, useState } from "react"
import { useAIOperations } from "@/hooks/use-ai-operations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, Clock, CheckCircle } from "lucide-react"

export function ConverterOperations() {
  const { getUserToolUsage, getUserPendingTasks, isLoading, error } = useAIOperations()
  const [converterUsage, setConverterUsage] = useState<any>(null)
  const [pendingTasks, setPendingTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      // Get tool usage
      const usage = await getUserToolUsage()
      const converterUsage = usage.find((tool: any) => tool.tool_name === "CSV Converter")
      setConverterUsage(converterUsage || { tool_name: "CSV Converter", usage_count: 0, last_used: null })

      // Get pending tasks
      const tasks = await getUserPendingTasks()
      const converterTasks = tasks.filter((task: any) => {
        // Filter tasks related to the converter tool
        // This assumes the operation_id is linked to an operation with tool_id for the converter
        return task.ai_operations?.tool_id === 1 // Assuming 1 is the ID for the converter tool
      })
      setPendingTasks(converterTasks)
    }

    fetchData()

    // Set up polling to check for updates every 5 seconds
    const interval = setInterval(fetchData, 5000)

    return () => clearInterval(interval)
  }, [getUserToolUsage, getUserPendingTasks])

  if (isLoading && !converterUsage) {
    return <div>Loading converter operations...</div>
  }

  if (error) {
    return <div>Error loading converter operations: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileUp className="h-5 w-5 text-primary" />
          <CardTitle>CSV Converter Operations</CardTitle>
        </div>
        <CardDescription>Track your CSV converter usage and pending tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage">
          <TabsList>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="tasks">Pending Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="usage" className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Total Usage</h3>
                  </div>
                  <p className="text-2xl font-bold">{converterUsage?.usage_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last used:{" "}
                    {converterUsage?.last_used ? new Date(converterUsage.last_used).toLocaleString() : "Never"}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Pending Tasks</h3>
                  </div>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingTasks.filter((task) => task.status === "completed").length} completed,{" "}
                    {pendingTasks.filter((task) => task.status === "failed").length} failed
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tasks" className="pt-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending tasks for the CSV Converter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{task.task_description}</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(task.created_at).toLocaleString()}
                      </div>
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
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
