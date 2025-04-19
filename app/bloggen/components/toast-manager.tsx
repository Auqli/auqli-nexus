"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useBloggen } from "@/hooks/use-bloggen"

export function ToastManager() {
  const { toast } = useToast()
  const { error, isGenerating } = useBloggen()

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  return null
}
