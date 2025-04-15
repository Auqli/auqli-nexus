import { NextResponse } from "next/server"
import { ImageGenerationConfig, enhanceComplexScenePrompt } from "@/config/image-generation-config"

// Get API key from environment variables
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY

/**
 * Enhances prompts with brand-specific details when brand names are detected
 */
function enhancePromptWithBrandDetails(prompt: string, config: any): string {
  // Check for common brand names in the prompt
  const brandNames = Object.keys(config.brandPromptEnhancements)
  let enhancedPrompt = prompt

  for (const brand of brandNames) {
    if (prompt.toLowerCase().includes(brand.toLowerCase())) {
      // Add brand-specific enhancements
      enhancedPrompt += `. ${config.brandPromptEnhancements[brand]}.`
      break // Only enhance for the first detected brand to avoid conflicts
    }
  }

  return enhancedPrompt
}

/**
 * Creates an enhanced negative prompt based on detected content
 */
function createEnhancedNegativePrompt(prompt: string, baseNegativePrompt: string, config: any): string {
  let enhancedNegativePrompt = baseNegativePrompt

  // Check for human-related content
  const humanRelatedTerms = ["person", "people", "man", "woman", "child", "face", "portrait", "selfie", "model"]
  const hasHumanContent = humanRelatedTerms.some((term) => prompt.toLowerCase().includes(term))

  if (hasHumanContent) {
    // Add anatomy-specific negative prompts
    enhancedNegativePrompt += `, ${config.anatomyNegativePrompts.faces}, ${config.anatomyNegativePrompts.hands}, ${config.anatomyNegativePrompts.eyes}`
  }

  // Check for text/logo content
  const textRelatedTerms = ["logo", "text", "label", "sign", "brand", "coca-cola", "pepsi", "nike", "adidas", "apple"]
  const hasTextContent = textRelatedTerms.some((term) => prompt.toLowerCase().includes(term))

  if (hasTextContent) {
    // Add text-specific enhancements to the positive prompt
    enhancedNegativePrompt += `, blurry text, illegible text, misspelled text, distorted logo, inaccurate logo`
  }

  return enhancedNegativePrompt
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const {
      prompt,
      modelId,
      imageData,
      numImages = 4,
      mode = "text-to-image",
      width = 1024,
      height = 1024,
      creativity = 0.7,
      useCase = "hero-banner",
      tone = "none",
    } = await request.json()

    // Validate required fields
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    // Check if API key is available
    if (!DEEPINFRA_API_KEY) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    console.log(`Generating images with model: ${modelId}`)
    console.log(`Prompt: ${prompt}`)

    // Determine which model configuration to use
    const modelConfig = modelId.includes("turbo")
      ? ImageGenerationConfig.models.speed
      : ImageGenerationConfig.models.quality

    // Map creativity to guidance scale (inverse relationship)
    // Higher creativity = lower guidance scale
    const guidanceScale = 7.5 - creativity * 5 // Range from 2.5 to 7.5

    // Get the use case configuration
    const useCaseConfig =
      ImageGenerationConfig.useCases.find((uc) => uc.id === useCase) || ImageGenerationConfig.useCases[0]

    // Get the prompt enhancer for this use case
    const promptEnhancerType = useCaseConfig.promptEnhancer || "general"

    // Fix: Use type assertion to tell TypeScript this is a valid key
    const promptEnhancer =
      ImageGenerationConfig.promptEnhancers[promptEnhancerType as keyof typeof ImageGenerationConfig.promptEnhancers] ||
      ImageGenerationConfig.promptEnhancers.general

    // Get tone addition if specified
    const toneAddition =
      tone !== "none" ? ImageGenerationConfig.toneOptions.find((t) => t.value === tone)?.promptAddition || "" : ""

    // Get creativity level prompt addition
    const creativityLevel =
      ImageGenerationConfig.creativityLevels.find((cl) => cl.value === Math.round((creativity * 100) / 10) * 10)
        ?.promptAddition || ""

    // Build the enhanced prompt
    let enhancedPrompt = ""

    if (mode === "text-to-image") {
      // For text-to-image mode
      enhancedPrompt = `${useCaseConfig.promptTemplate} ${prompt}. 
   ${promptEnhancer} ${toneAddition} ${creativityLevel} ${modelConfig.promptEnhancement}`.trim()

      // Add brand-specific enhancements if brands are detected
      enhancedPrompt = enhancePromptWithBrandDetails(enhancedPrompt, ImageGenerationConfig)

      // Add complex scene enhancements for quality mode
      if (modelId === ImageGenerationConfig.models.quality.id) {
        enhancedPrompt = enhanceComplexScenePrompt(enhancedPrompt)
      }
    } else {
      // For image-remix mode
      enhancedPrompt = `Remix the uploaded image to create ${prompt}. 
       ${promptEnhancer} ${toneAddition} ${creativityLevel} ${modelConfig.promptEnhancement}`.trim()
    }

    console.log("Enhanced prompt:", enhancedPrompt)

    // Create an enhanced negative prompt
    const enhancedNegativePrompt = createEnhancedNegativePrompt(
      prompt,
      modelConfig.negativePrompt,
      ImageGenerationConfig,
    )

    console.log("Enhanced negative prompt:", enhancedNegativePrompt)

    // Determine number of inference steps based on model and creativity
    let numInferenceSteps = modelId.includes("turbo")
      ? Math.min(modelConfig.inferenceSteps.max, Math.max(modelConfig.inferenceSteps.min, Math.round(creativity * 10)))
      : Math.min(modelConfig.inferenceSteps.max, Math.max(modelConfig.inferenceSteps.min, Math.round(creativity * 50)))

    // For complex prompts in quality mode, increase the inference steps
    if (modelId === ImageGenerationConfig.models.quality.id && prompt.length > 100) {
      // For longer, more detailed prompts, use more inference steps
      numInferenceSteps = Math.min(modelConfig.inferenceSteps.max, numInferenceSteps + 5)
    }

    let calculatedGuidanceScale = 7.5 - creativity * 5 // Range from 2.5 to 7.5

    // For complex prompts in quality mode, adjust the guidance scale
    if (modelId === ImageGenerationConfig.models.quality.id && prompt.length > 100) {
      // For detailed prompts, slightly increase guidance to follow the prompt more closely
      calculatedGuidanceScale = Math.min(9.0, calculatedGuidanceScale + 0.5)
    }

    // Prepare the API request
    const apiRequestBody: any = {
      prompt: enhancedPrompt,
      input: enhancedPrompt, // Add this line to include the required 'input' field
      num_images: numImages,
      num_inference_steps: numInferenceSteps,
      guidance_scale: calculatedGuidanceScale,
      width: width,
      height: height,
      negative_prompt: enhancedNegativePrompt,
    }

    // If we have image data for remix mode, add it to the request
    if (imageData && mode === "image-remix") {
      // Extract the base64 data from the data URL
      const base64Data = imageData.split(",")[1]
      apiRequestBody.image = base64Data

      // Adjust parameters for image-to-image generation
      apiRequestBody.strength = 0.7 // How much to transform the image (0.0 to 1.0)
    }

    console.log(
      `API request prepared with ${numInferenceSteps} inference steps and guidance scale ${calculatedGuidanceScale}`,
    )

    // Call the DeepInfra API
    let response
    try {
      response = await fetch(`https://api.deepinfra.com/v1/inference/${modelId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
        },
        body: JSON.stringify(apiRequestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("DeepInfra API error:", response.status, errorData)

        // If model is not available, try the fallback model
        if (response.status === 404 && errorData?.detail?.error === "Model is not available") {
          console.log("Model not available, trying fallback model...")

          // Use SDXL Turbo as fallback
          const fallbackModelId = "stabilityai/sdxl-turbo"

          response = await fetch(`https://api.deepinfra.com/v1/inference/${fallbackModelId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
            },
            body: JSON.stringify({
              ...apiRequestBody,
              input: enhancedPrompt, // Ensure input field is present in fallback request
              num_inference_steps: 8, // Use appropriate steps for turbo model
            }),
          })

          if (!response.ok) {
            throw new Error(`Fallback API error: ${response.status}`)
          }
        } else {
          throw new Error(`API error: ${response.status} ${JSON.stringify(errorData)}`)
        }
      }
    } catch (error) {
      console.error("Error calling DeepInfra API:", error)
      throw error
    }

    const data = await response.json()

    // Extract image URLs from the response
    let images = []

    if (data.images && Array.isArray(data.images)) {
      // For both models, the images should be in this format
      images = data.images
    } else if (data.output && Array.isArray(data.output)) {
      // Alternative response format
      images = data.output
    } else if (data.results && Array.isArray(data.results)) {
      // Another alternative response format
      images = data.results.map((result) => result.image || result.output || "")
    }

    // Filter out any empty strings
    images = images.filter((img) => img)

    if (images.length === 0) {
      throw new Error("No images were generated in the response")
    }

    return NextResponse.json({
      images,
      model: modelId,
      status: "success",
      enhancedPrompt: enhancedPrompt,
    })
  } catch (error) {
    console.error("Error generating images:", error)

    // Provide more specific error messages based on the error
    let errorMessage = "Failed to generate images. Please try again."
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "API configuration is missing. Please contact support."
      } else if (error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please try again in a few minutes."
        statusCode = 429
      } else if (error.message.includes("413")) {
        errorMessage = "The image or prompt is too large. Please use a smaller image or shorter prompt."
        statusCode = 413
      } else if (error.message.includes("400")) {
        errorMessage = "Invalid request. Please check your inputs and try again."
        statusCode = 400
      } else if (error.message.includes("No images were generated")) {
        errorMessage =
          "The AI model couldn't generate images with your prompt. Try a different description or settings."
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: statusCode },
    )
  }
}
