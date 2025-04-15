import { AI_MODELS } from "@/config/ai-config"

/**
 * Returns the appropriate model for the given request options
 * @param {Object} options - The request options
 * @param {string} options.contentType - The type of content to generate
 * @param {boolean} [options.browsing=false] - Whether browsing is enabled
 * @param {string} [options.language="en"] - The language to use
 * @param {boolean} [options.fastMode=false] - Whether to use fast mode
 * @returns {string} The model ID to use
 */
export function getModelForRequest(options) {
  const { contentType, browsing = false, language = "en", fastMode = false } = options

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
