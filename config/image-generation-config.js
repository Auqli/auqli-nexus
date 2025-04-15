// Extremely simplified version with no complexity
const ImageGenerationConfig = {
  models: {
    quality: {
      id: "stabilityai/stable-diffusion-xl-base-1.0",
      name: "Stable Diffusion XL",
      promptEnhancement: "High quality",
      negativePrompt: "low quality",
    },
    speed: {
      id: "stabilityai/sdxl-turbo",
      name: "SDXL Turbo",
      promptEnhancement: "High quality",
      negativePrompt: "low quality",
    },
  },
  useCases: [
    {
      id: "hero-banner",
      name: "Hero Banner",
      promptTemplate: "Create an image showing",
      promptEnhancer: "general",
    },
  ],
  promptEnhancers: {
    general: "Masterful composition",
    product: "Clean studio shot",
    social: "Engaging, vibrant colors",
  },
}

// Simple function
function enhanceComplexScenePrompt(prompt) {
  return prompt
}

// Simple function
function expandMinimalPrompt(prompt) {
  return prompt
}

module.exports = {
  ImageGenerationConfig,
  enhanceComplexScenePrompt,
  expandMinimalPrompt,
}
