import { AI_MODELS } from "@/config/ai-config"

// Simplified model routing without nested objects
export const MODEL_ROUTING = {
  default: AI_MODELS.DEEPINFRA_LLAMA4,
  browsing: AI_MODELS.DEEPINFRA_LLAMA4,
  fastMode: {
    default: AI_MODELS.DEEPINFRA_DEEPSEEK,
  },
}
