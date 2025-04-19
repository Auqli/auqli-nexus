"use client"

import { Clock, Calendar, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useBloggen } from "@/hooks/use-bloggen"
import type { BloggenPreset } from "@/types/bloggen"

interface ScheduledStatusBoxProps {
  preset: BloggenPreset | null
}

export function ScheduledStatusBox({ preset }: ScheduledStatusBoxProps) {
  const { updatePreset } = useBloggen()

  const handleToggleSchedule = async (enabled: boolean) => {
    if (preset) {
      await updatePreset({
        daily_schedule_enabled: enabled,
      })
    }
  }

  const getModelName = (modelId: string) => {
    const modelMap: Record<string, string> = {
      "mistralai/Mistral-Small-24B-Instruct-2501": "Mistral",
      "Qwen/Qwen2.5-7B-Instruct": "Qwen",
      "deepseek-ai/DeepSeek-V3": "DeepSeek",
    }
    return modelMap[modelId] || modelId
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-orange-500" />
          Scheduled Generation
        </CardTitle>
        <CardDescription>Set up automatic daily blog generation on autopilot</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            <span className="font-medium">Auto-Generation</span>
          </div>
          <Switch checked={preset?.daily_schedule_enabled || false} onCheckedChange={handleToggleSchedule} />
        </div>

        {preset?.daily_schedule_enabled ? (
          <div className="space-y-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <Badge variant="success" className="bg-emerald-500">
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Blogs per day</span>
              <span className="font-medium">{preset.scheduled_count_per_day}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Model</span>
              <span className="font-medium">{getModelName(preset.preferred_model)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Schedule</span>
              <span className="font-medium">Daily at 2:00 AM UTC</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-1">Auto-Generation Off</h3>
            <p className="text-sm text-gray-500 mb-4">Enable to automatically generate blogs on a daily schedule</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => document.getElementById("settings-tab")?.click()}>
          <Settings className="h-4 w-4 mr-2" />
          Configure Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
