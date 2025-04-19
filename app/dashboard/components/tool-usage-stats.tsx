"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getBrowserClient } from "@/lib/supabase"

interface ToolUsage {
  tool_name: string
  usage_count: number
  last_used: string
}

export function ToolUsageStats() {
  const [toolUsage, setToolUsage] = useState<ToolUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getBrowserClient()

  useEffect(() => {
    async function fetchToolUsage() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          throw new Error("Failed to get current user")
        }

        if (!userData.user) {
          throw new Error("User not authenticated")
        }

        const { data, error } = await supabase.from("view_user_tool_usage").select("*").eq("user_id", userData.user.id)

        if (error) {
          throw new Error(error.message)
        }

        setToolUsage(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tool usage")
        console.error("Error fetching tool usage:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToolUsage()
  }, [supabase])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tool Usage</CardTitle>
          <CardDescription>Loading your tool usage statistics...</CardDescription>
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
          <CardTitle>Tool Usage</CardTitle>
          <CardDescription>There was an error loading your tool usage</CardDescription>
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
        <CardTitle>Tool Usage</CardTitle>
        <CardDescription>Your AI tool usage statistics</CardDescription>
      </CardHeader>
      <CardContent>
        {toolUsage.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't used any AI tools yet.</p>
            <p className="text-sm mt-2">Try out our tools to see usage statistics here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {toolUsage.map((tool, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium">{tool.tool_name}</div>
                  <div className="text-sm text-gray-500">Last used: {new Date(tool.last_used).toLocaleString()}</div>
                </div>
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {tool.usage_count} {tool.usage_count === 1 ? "use" : "uses"}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
