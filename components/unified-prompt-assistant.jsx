"use client"
import { Button } from "@/components/ui/button"

export function UnifiedPromptAssistant({ initialPrompt, onPromptGenerated }) {
  function handleClick() {
    if (typeof onPromptGenerated === "function") {
      onPromptGenerated(initialPrompt || "")
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
    >
      Prompt Assistant
    </Button>
  )
}
