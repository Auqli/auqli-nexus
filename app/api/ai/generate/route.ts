import { NextResponse } from "next/server"
import { buildPrompt } from "@/lib/prompt-builder"
import { getModelForRequest } from "@/lib/model-router"
import { ERROR_MESSAGES } from "@/config/ai-config"
import { MODEL_ROUTING } from "@/config/model-routing"

// Get API keys from environment variables
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY

// Update the POST function to use the updated model router
export async function POST(request: Request) {
  try {
    // Parse the request body
    const {
      contentType,
      tone,
      creativity,
      length,
      input,
      language = "auto",
      browsing = false,
      fastMode = false,
    } = await request.json()

    // Validate required fields
    if (!contentType || !tone || creativity === undefined || !length || !input) {
      return NextResponse.json({ error: "Missing required fields", status: "error" }, { status: 400 })
    }

    // Build the prompt
    const prompt = await buildPrompt({
      contentType,
      tone,
      creativity,
      length,
      input,
      language,
      browsing,
    })

    // Get the appropriate model for this request
    const modelId = getModelForRequest({
      contentType,
      browsing,
      language,
      fastMode,
    })

    // Determine which API to use based on the model
    let response
    if (modelId.includes("deepinfra") || modelId.includes("meta-llama") || modelId.includes("deepseek")) {
      response = await callDeepInfraAPI(modelId, prompt, creativity)
    } else if (modelId.includes("llama3") || modelId.includes("gemma")) {
      response = await callGroqAPI(modelId, prompt, creativity)
    } else {
      // Fallback or error for unsupported model
      throw new Error(`Unsupported model: ${modelId}`)
    }

    // Clean the response content
    if (response && response.content) {
      response.content = cleanGeneratedContent(response.content)

      // If the cleaning function detected an invalid response, try with the backup model
      if (response.content === "ERROR_INVALID_RESPONSE") {
        console.log("Invalid response detected, trying with backup model...")

        // Use the backup/fast model
        const backupModelId = MODEL_ROUTING.fastMode.default

        const backupResponse = await callDeepInfraAPI(
          backupModelId,
          prompt + "\n\nIMPORTANT: Generate ONLY the requested content. DO NOT list content types.",
          creativity,
        )

        if (backupResponse && backupResponse.content) {
          backupResponse.content = cleanGeneratedContent(backupResponse.content)
          return NextResponse.json(backupResponse)
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating content:", error)

    // Determine the appropriate error message
    let errorMessage = ERROR_MESSAGES.default
    if (error instanceof Error) {
      if (error.message.includes("configuration") || error.message.includes("API key")) {
        errorMessage = ERROR_MESSAGES.missingConfig
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = ERROR_MESSAGES.networkError
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        errorMessage = ERROR_MESSAGES.rateLimited
      } else if (error.message.includes("model")) {
        errorMessage = ERROR_MESSAGES.modelError
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        status: "error",
        details:
          process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 },
    )
  }
}

// Add the cleaning function to this file as well
function cleanGeneratedContent(content: string): string {
  // Remove common instruction patterns
  const cleanedContent = content
    .replace(/Use markdown formatting\.?/g, "")
    .replace(/Use bullet points for features and benefits\..*?points\./gs, "")
    .replace(/Use a friendly and humorous tone\..*?concise\./gs, "")
    .replace(/Use emojis where appropriate\.?/g, "")
    .replace(/^Instructions:.*?$/gm, "")
    .replace(/^Instagram Post$/m, "")
    .replace(/^Twitter Post$/m, "")
    .replace(/^Email Subject Line$/m, "")
    .replace(/^Facebook Ad$/m, "")
    .replace(/^Product Description$/m, "")
    .replace(/^TikTok Script$/m, "")
    .replace(/^Linkedin Post$/m, "")
    .replace(/^Google Ad Copy$/m, "")
    .trim()

  // If the content is just a list of content types or appears to be instructions,
  // return an error message that will trigger regeneration
  if (
    cleanedContent.includes("Instagram Post") &&
    cleanedContent.includes("Twitter Post") &&
    cleanedContent.includes("Email Subject Line")
  ) {
    return "ERROR_INVALID_RESPONSE"
  }

  return cleanedContent
}

async function callDeepInfraAPI(modelId: string, prompt: string, temperature: number) {
  if (!DEEPINFRA_API_KEY) {
    throw new Error("Missing DeepInfra API key configuration")
  }

  const response = await fetch(`https://api.deepinfra.com/v1/inference/${modelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify({
      input: prompt,
      temperature: temperature,
      max_new_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`DeepInfra API error: ${response.status} ${JSON.stringify(errorData)}`)
  }

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
    throw new Error("Unexpected response format from DeepInfra")
  }

  return {
    content: generatedContent,
    model: modelId,
    status: "success",
  }
}

async function callGroqAPI(modelId: string, prompt: string, temperature: number) {
  if (!GROQ_API_KEY) {
    throw new Error("Missing Groq API key configuration")
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: prompt.split("\n\n")[0] }, // System prompt
        { role: "user", content: prompt.split("\n\n")[1] }, // User prompt
      ],
      temperature: temperature,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Groq API error: ${response.status} ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()

  // Extract the generated content
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Unexpected response format from Groq")
  }

  const generatedContent = data.choices[0].message.content

  return {
    content: generatedContent,
    model: modelId,
    status: "success",
  }
}
