"use client"
import { Button } from "@/components/ui/button"

export function UnifiedPromptAssistant({ initialPrompt, onPromptGenerated }) {
  // Simplified placeholder implementation
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPromptGenerated(initialPrompt)}
      className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
    >
      Prompt Assistant
    </Button>
  )
}
