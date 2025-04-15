export const ImageGenerationConfig = {
  models: {
    quality: {
      id: "stabilityai/stable-diffusion-xl-base-1.0",
      name: "Stable Diffusion XL",
      promptEnhancement: "High quality, detailed, professional photography",
      negativePrompt:
        "low quality, bad quality, blurry, pixelated, unnatural, artifacts, distortions, cropped, text, watermark",
      inferenceSteps: {
        min: 25,
        max: 40,
      },
    },
    speed: {
      id: "stabilityai/sdxl-turbo",
      name: "SDXL Turbo",
      promptEnhancement: "High quality, detailed",
      negativePrompt: "low quality, bad quality, blurry, pixelated, unnatural, artifacts, distortions, cropped",
      inferenceSteps: {
        min: 4,
        max: 8,
      },
    },
  },
  useCases: [
    {
      id: "hero-banner",
      name: "Hero Banner",
      promptTemplate: "Create an image showing",
      promptEnhancer: "general",
    },
    {
      id: "product-shot",
      name: "Product Shot",
      promptTemplate: "Create a product shot showing",
      promptEnhancer: "product",
    },
    {
      id: "social-post",
      name: "Social Media Post",
      promptTemplate: "Create a social media post showing",
      promptEnhancer: "social",
    },
  ],
  promptEnhancers: {
    general: "Masterful composition, photorealistic, 8k resolution",
    product: "Clean studio shot, detailed textures, professional lighting",
    social: "Engaging, vibrant colors, trending style",
  },
  toneOptions: [
    { value: "none", label: "None", promptAddition: "" },
    { value: "vibrant", label: "Vibrant", promptAddition: "Vibrant colors" },
    { value: "minimalist", label: "Minimalist", promptAddition: "Minimalist style" },
  ],
  creativityLevels: [
    { value: 20, label: "Low", promptAddition: "" },
    { value: 50, label: "Medium", promptAddition: "" },
    { value: 80, label: "High", promptAddition: "" },
  ],
  brandPromptEnhancements: {
    "Coca-Cola": "Classic Coca-Cola branding, red and white colors, refreshing",
    Nike: "Nike swoosh logo, athletic wear, dynamic poses",
    Apple: "Apple product design, minimalist aesthetic, clean lines",
  },
  anatomyNegativePrompts: {
    faces: "deformed face, disfigured face, mutated face, bad anatomy, poorly drawn face",
    hands: "deformed hands, disfigured hands, mutated hands, poorly drawn hands",
    eyes: "deformed eyes, disfigured eyes, mutated eyes, poorly drawn eyes",
  },
  examplePrompts: [
    "A futuristic cityscape at sunset",
    "A serene mountain landscape with a clear lake",
    "A close-up of a blooming flower with vibrant colors",
    "A cozy living room with a fireplace and comfortable furniture",
    "A bustling city street with people and traffic",
    "A peaceful beach with clear water and white sand",
  ],
  productDefaults: {
    clothing: {
      style: "fashion editorial",
      lighting: "soft natural",
    },
    electronics: {
      style: "minimalist",
      lighting: "studio",
    },
  },
}

// Simple function with no TypeScript complexity
export function enhanceComplexScenePrompt(prompt) {
  return `${prompt}, intricate details, volumetric lighting, cinematic composition, trending on artstation`
}

// Simple function with no TypeScript complexity
export function expandMinimalPrompt(prompt, useCase, productCategory) {
  let expandedPrompt = prompt

  // Add product-specific details
  if (productCategory && productCategory !== "none") {
    const categoryDetails = {
      clothing: "with visible fabric texture, stitching details, and proper fit. Natural lighting to show true colors.",
      electronics: "with clean design, visible features, and proper scale. Studio lighting to highlight details.",
      beauty:
        "with clear packaging, visible texture, and proper color representation. Soft lighting for appealing look.",
      furniture: "showing material quality, craftsmanship, and in a styled setting. Warm lighting for inviting feel.",
      food: "with appetizing presentation, vibrant colors, and proper styling. Professional food photography lighting.",
    }

    if (categoryDetails[productCategory]) {
      expandedPrompt += `. ${categoryDetails[productCategory]}`
    }
  }

  // Add use case specific enhancements
  const useCaseConfig = ImageGenerationConfig.useCases.find((uc) => uc.id === useCase)
  if (useCaseConfig) {
    // Extract the template without the "Create a" part
    const template = useCaseConfig.promptTemplate.replace(/^Create an? /i, "").replace(/showing/i, "with")

    // Only add if not already in the prompt
    if (!expandedPrompt.toLowerCase().includes(template.toLowerCase())) {
      expandedPrompt += `. ${template}`
    }
  }

  // Add photography style enhancements if not already detailed
  if (expandedPrompt.split(/\s+/).length < 20) {
    expandedPrompt += ". Professional photography, high resolution, detailed textures, masterful composition."
  }

  return expandedPrompt
}
