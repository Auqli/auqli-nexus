"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import type { BloggenPreset } from "@/types/bloggen"

const AI_MODELS = {
  "mistralai/Mistral-Small-24B-Instruct-2501": "Mistral Small 24B",
  "deepseek-ai/DeepSeek-V3": "DeepSeek V3",
  "Qwen/Qwen2.5-7B-Instruct": "Qwen 2.5 7B",
}

interface ScheduleStatusCardProps {
  preset: BloggenPreset | null
}

export function ScheduleStatusCard({ preset }: ScheduleStatusCardProps) {
  // Calculate next run time (2:00 AM UTC)
  const getNextRunTime = () => {
    const now = new Date()
    const nextRun = new Date(now)
    nextRun.setUTCHours(2, 0, 0, 0)

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    return nextRun
  }

  const nextRun = getNextRunTime()
  const formattedNextRun = nextRun.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Status</CardTitle>
        <CardDescription>Current status of your automated blog generation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          {preset?.daily_schedule_enabled ? (
            <Badge variant="success" className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Blogs per day</span>
            <span className="font-medium">{preset?.scheduled_count_per_day || 0}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Model</span>
            <span className="font-medium">
              {preset?.preferred_model ? AI_MODELS[preset.preferred_model] || preset.preferred_model : "Not set"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Word count</span>
            <span className="font-medium">{preset?.word_count_target || 0}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="text-sm">Last Run</span>
            </div>
            <p className="font-medium">
              {preset?.last_run_at ? new Date(preset.last_run_at).toLocaleString() : "Never"}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span className="text-sm">Next Run</span>
            </div>
            <p className="font-medium">{preset?.daily_schedule_enabled ? formattedNextRun : "Scheduler disabled"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
