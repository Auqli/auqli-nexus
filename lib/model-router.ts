import { AI_MODELS } from "@/config/ai-config"

interface ModelRouterOptions {
  contentType: string
  browsing?: boolean
  language?: string
  fastMode?: boolean
}

export function getModelForRequest(options: ModelRouterOptions): string {
  const { fastMode = false, browsing = false } = options

  // Simple logic without dynamic property access
  if (fastMode) {
    return AI_MODELS.DEEPINFRA_DEEPSEEK
  }

  if (browsing) {
    return AI_MODELS.DEEPINFRA_LLAMA4
  }

  // Default model
  return AI_MODELS.DEEPINFRA_LLAMA4
}
