"use client"

import { useState } from "react"
import { trackAiOperation } from "@/app/actions/track-ai-operation"

export function useTrackOperation() {
  const [isTracking, setIsTracking] = useState(false)
  const [lastTrackingResult, setLastTrackingResult] = useState<any>(null)

  const trackOperation = async (
    toolId: number,
    inputMeta: any = {},
    outputMeta: any = {},
    status: "success" | "error" | "pending" = "success",
  ) => {
    try {
      setIsTracking(true)
      const result = await trackAiOperation(toolId, inputMeta, outputMeta, status)
      setLastTrackingResult(result)
      return result
    } catch (error) {
      console.error("Error in tracking operation:", error)
      setLastTrackingResult({ success: false, error })
      return { success: false, error }
    } finally {
      setIsTracking(false)
    }
  }

  return {
    trackOperation,
    isTracking,
    lastTrackingResult,
  }
}
