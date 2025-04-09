import { MODEL_ROUTING, AI_MODELS } from "@/config/ai-config"

interface ModelRouterOptions {
  contentType: string
  browsing?: boolean
  language?: string
  fastMode?: boolean
}

export function getModelForRequest(options: ModelRouterOptions): string {
  const { contentType, browsing = false, language = "en", fastMode = false } = options

  // If fast mode is enabled, use the fast mode model
  if (fastMode && MODEL_ROUTING.fastMode) {
    if (MODEL_ROUTING.fastMode[contentType]) {
      return MODEL_ROUTING.fastMode[contentType]
    }
    if (MODEL_ROUTING.fastMode.default) {
      return MODEL_ROUTING.fastMode.default
    }
  }

  // If browsing is enabled and we have browsing models configured
  if (browsing && MODEL_ROUTING.browsing && Object.keys(MODEL_ROUTING.browsing).length > 0) {
    // Check if there's a specific model for this content type
    if (MODEL_ROUTING.browsing[contentType]) {
      return MODEL_ROUTING.browsing[contentType]
    }
    // Otherwise use the default browsing model
    if (MODEL_ROUTING.browsing.default) {
      return MODEL_ROUTING.browsing.default
    }
  }

  // Check if there's a language-specific model
  if (MODEL_ROUTING.languages && MODEL_ROUTING.languages[language]) {
    if (MODEL_ROUTING.languages[language][contentType]) {
      return MODEL_ROUTING.languages[language][contentType]
    }
    if (MODEL_ROUTING.languages[language].default) {
      return MODEL_ROUTING.languages[language].default
    }
  }

  // Use the default model for this content type
  if (MODEL_ROUTING.default[contentType]) {
    return MODEL_ROUTING.default[contentType]
  }

  // Fallback to a default model
  return AI_MODELS.DEEPINFRA_LLAMA4
}
