import { AI_MODELS } from "@/config/ai-config"

export const MODEL_ROUTING = {
  default: {
    "product-titles": AI_MODELS.DEEPINFRA_LLAMA4,
    "product-descriptions": AI_MODELS.DEEPINFRA_LLAMA4,
    "ad-copy": AI_MODELS.DEEPINFRA_LLAMA4,
    "social-captions": AI_MODELS.DEEPINFRA_LLAMA4,
    "blog-articles": AI_MODELS.DEEPINFRA_LLAMA4,
    emails: AI_MODELS.DEEPINFRA_LLAMA4,
  },
  browsing: {
    default: AI_MODELS.DEEPINFRA_LLAMA4,
    "blog-articles": AI_MODELS.DEEPINFRA_LLAMA4,
  },
  languages: {
    es: {
      default: AI_MODELS.DEEPINFRA_LLAMA4,
    },
    fr: {
      default: AI_MODELS.DEEPINFRA_LLAMA4,
    },
    de: {
      default: AI_MODELS.DEEPINFRA_LLAMA4,
    },
  },
  fastMode: {
    default: AI_MODELS.DEEPINFRA_DEEPSEEK,
  },
}
