import { NextResponse } from "next/server"
import { SYSTEM_PROMPT } from "@/config/ai-config"
import type { NextRequest } from "next/server"

// Get the Deep Infra API key from environment variables
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY

// Define the model ID - using DeepSeek as default for reliability
const DEFAULT_MODEL_ID = "deepseek-ai/DeepSeek-R1-Turbo"
const LLAMA_MODEL_ID = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"

// Add this function to clean the response
function cleanGeneratedContent(content: string): string {
  // Remove common instruction patterns
  const cleanedContent = content
    .replace(/Use markdown formatting\.?/g, "")
    .replace(/Use bullet points for features and benefits\..*?points\./gs, "")
    .replace(/Use a friendly and humorous tone\..*?concise\./gs, "")
    .replace(/Use emojis where appropriate\.?/g, "")
    .replace(/^Instructions:.*?$/gm, "")
    .replace(/^Instagram Post$/m, "## Instagram Post")
    .replace(/^Twitter Post$/m, "## Twitter Post")
    .replace(/^Email Subject Line$/m, "## Email Subject Line")
    .replace(/^Facebook Ad$/m, "## Facebook Ad")
    .replace(/^Product Description$/m, "## Product Description")
    .replace(/^TikTok Script$/m, "## TikTok Script")
    .replace(/^Linkedin Post$/m, "## LinkedIn Post")
    .replace(/^Google Ad Copy$/m, "## Google Ad Copy")
    .trim()

  // If the content is just a list of content types or appears to be instructions,
  // return an error message that will trigger regeneration
  if (
    cleanedContent.includes("Instagram Post") &&
    cleanedContent.includes("Twitter Post") &&
    cleanedContent.includes("Email Subject Line") &&
    cleanedContent.length < 500
  ) {
    return "ERROR_INVALID_RESPONSE"
  }

  return cleanedContent
}

// Update the POST function to use the cleaning function and handle errors
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { contentType, prompt, tone, creativity, length } = await request.json()

    // Validate required fields
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create a prompt template
    const fullPrompt = `${SYSTEM_PROMPT}

You are creating ${length || "medium"} content with a ${tone || "professional"} tone.

Create compelling, well-structured content for: ${prompt}

Focus on the ${contentType} format and make it engaging and effective. 
DO NOT list different content types. DO NOT include instructions in your response.
Respond ONLY with the requested content.`

    console.log("Sending prompt to AI model:", fullPrompt.substring(0, 100) + "...")

    // Set parameters
    const temperature = Number.parseFloat(creativity?.toString() || "0.7") || 0.7
    const maxTokens = 1000

    // Try with Llama model first
    try {
      const llamaResponse = await callDeepInfraAPI(LLAMA_MODEL_ID, fullPrompt, temperature, maxTokens)

      // Clean the generated content
      const cleanedContent = cleanGeneratedContent(llamaResponse.content)

      // If the response is valid, return it
      if (cleanedContent !== "ERROR_INVALID_RESPONSE") {
        return NextResponse.json({
          content: cleanedContent,
          status: "success",
          format: "markdown",
          model: LLAMA_MODEL_ID,
        })
      }

      // If we get here, the Llama model returned an invalid response
      console.log("Llama model returned invalid response, trying DeepSeek...")
    } catch (llamaError) {
      console.error("Error with Llama model:", llamaError)
      // Continue to DeepSeek model
    }

    // If Llama failed or returned invalid content, try with DeepSeek
    const deepseekResponse = await callDeepInfraAPI(
      DEFAULT_MODEL_ID,
      fullPrompt + "\n\nIMPORTANT: Generate ONLY the requested content. DO NOT list content types.",
      temperature,
      maxTokens,
    )

    // Clean the DeepSeek response
    const cleanedDeepseekContent = cleanGeneratedContent(deepseekResponse.content)

    return NextResponse.json({
      content: cleanedDeepseekContent,
      status: "success",
      format: "markdown",
      model: DEFAULT_MODEL_ID,
    })
  } catch (error) {
    console.error("Error generating copy:", error)

    // Ensure we always return a valid JSON response
    return NextResponse.json(
      {
        error: "Failed to generate content. Please try again.",
        status: "error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to call DeepInfra API with better error handling
async function callDeepInfraAPI(modelId: string, prompt: string, temperature: number, maxTokens: number) {
  if (!DEEPINFRA_API_KEY) {
    throw new Error("Missing DeepInfra API key configuration")
  }

  try {
    const response = await fetch(`https://api.deepinfra.com/v1/inference/${modelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
      },
      body: JSON.stringify({
        input: prompt,
        temperature: temperature,
        max_new_tokens: maxTokens,
      }),
    })

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DeepInfra API error (${modelId}):`, response.status, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    // Parse the response
    const data = await response.json()

    // Extract the generated content
    let generatedContent = ""
    if (data.results && data.results[0] && data.results[0].generated_text) {
      generatedContent = data.results[0].generated_text
    } else if (data.generated_text) {
      generatedContent = data.generated_text
    } else if (data.output) {
      generatedContent = data.output
    } else {
      throw new Error("Unexpected response format")
    }

    return {
      content: generatedContent,
      model: modelId,
    }
  } catch (error) {
    console.error(`Error calling DeepInfra API (${modelId}):`, error)
    throw error
  }
}
