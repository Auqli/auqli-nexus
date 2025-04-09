import { CONTENT_TYPES, TONE_OPTIONS, LENGTH_OPTIONS, SYSTEM_PROMPT } from "@/config/ai-config"
import { detectLanguage } from "@/lib/language-utils"

interface PromptBuilderOptions {
  contentType: string
  tone: string
  creativity: number
  length: string
  input: string
  language?: string
  browsing?: boolean
}

export async function buildPrompt(options: PromptBuilderOptions): Promise<string> {
  const { contentType, tone, creativity, length, input, language = "auto", browsing = false } = options

  // Find the content type configuration
  const contentTypeConfig = CONTENT_TYPES.find((ct) => ct.id === contentType)
  if (!contentTypeConfig) {
    throw new Error(`Content type "${contentType}" not found`)
  }

  // Find the tone description
  const toneOption = TONE_OPTIONS.find((t) => t.value === tone)
  const toneDesc = toneOption?.promptDesc || `Use a ${tone} tone`

  // Find the length description
  const lengthOption = LENGTH_OPTIONS.find((l) => l.value === length)
  const lengthDesc = lengthOption?.promptDesc || `Make it ${length} length`

  // Get word count guidance for this content type and length
  const wordCount = lengthOption?.wordCount[contentType] || ""

  // Determine language instruction
  let languageInstruction = ""
  if (language === "auto") {
    // Auto-detect language from input
    const detectedLanguage = await detectLanguage(input)
    if (detectedLanguage && detectedLanguage !== "en") {
      languageInstruction = `Respond in ${detectedLanguage}.`
    }
  } else if (language !== "en") {
    // Use specified language
    languageInstruction = `Respond in ${language}.`
  }

  // Build creativity instruction
  const creativityDesc = getCreativityDescription(creativity)

  // Get the prompt template for this content type
  const promptTemplate = contentTypeConfig.promptTemplate

  // Replace placeholders in the template
  let prompt = promptTemplate
    .replace("{input}", input)
    .replace("{tone}", toneDesc)
    .replace("{length}", `${lengthDesc} (approximately ${wordCount})`)
    .replace("{languageInstruction}", languageInstruction)

  // Add creativity instruction
  prompt += ` ${creativityDesc}`

  // Add browsing instruction if enabled
  if (browsing) {
    prompt += " Use the most up-to-date information available to you."
  }

  // Combine with system prompt
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`

  return fullPrompt
}

function getCreativityDescription(creativity: number): string {
  // Convert creativity value (0-1) to a description
  if (creativity < 0.3) {
    return "Be conservative and straightforward in your writing style."
  } else if (creativity < 0.7) {
    return "Use a balanced approach to creativity, mixing conventional and novel elements."
  } else {
    return "Be highly creative and innovative in your writing style."
  }
}
