import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getBloggenService } from "@/lib/services/bloggen-service"
import { withOperationLogging } from "@/lib/ai-operation-logger"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY || ""

// DeepInfra API key
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY

// Function to generate blog content
async function generateBlogContent(prompt: string, model = "mistralai/Mistral-Small-24B-Instruct-2501") {
  if (!DEEPINFRA_API_KEY) {
    throw new Error("Missing DeepInfra API key")
  }

  const response = await fetch(`https://api.deepinfra.com/v1/inference/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify({
      input: prompt,
      temperature: 0.7,
      max_new_tokens: 4000,
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

  return generatedContent
}

// Function to build the prompt for blog generation
function buildBlogPrompt(
  vertical: string,
  keyword: string,
  tone: string,
  style: string,
  wordCount: number,
  components: { intro: boolean; cta: boolean; stats: boolean; [key: string]: boolean },
  customInstructions: string,
) {
  let prompt = `You are an expert content writer specializing in creating high-quality, SEO-optimized blog posts.

Write a comprehensive, engaging blog post about ${keyword} in the ${vertical} industry.

TONE: ${tone}
WRITING STYLE: ${style}
TARGET WORD COUNT: ${wordCount} words

REQUIRED COMPONENTS:`

  if (components.intro) {
    prompt += "\n- Include an engaging introduction that hooks the reader"
  }
  if (components.stats) {
    prompt += "\n- Include relevant statistics and data points to support your arguments"
  }
  if (components.cta) {
    prompt += "\n- Include a compelling call-to-action at the end"
  }

  if (customInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`
  }

  prompt += `\n
FORMAT:
1. Create a compelling title for the blog post
2. Write the full blog post content in markdown format
3. Ensure the content is well-structured with headings, subheadings, and bullet points where appropriate
4. Aim for the target word count

OUTPUT FORMAT:
Title: [Blog Post Title]

[Full blog post content in markdown]`

  return prompt
}

// Function to count words in a text
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

// Function to extract title from generated content
function extractTitle(content: string): { title: string; content: string } {
  const titleMatch = content.match(/^Title:\s*(.+?)(?:\n|$)/)
  let title = "Untitled Blog Post"
  let cleanContent = content

  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim()
    cleanContent = content.replace(/^Title:\s*(.+?)(?:\n|$)/, "").trim()
  }

  return { title, content: cleanContent }
}

// Main scheduled generation function
async function runScheduledGeneration() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const bloggenService = getBloggenService()

    // Get all users with scheduled generation enabled
    const { data: users, error } = await supabase
      .from("bloggen_presets")
      .select(
        "user_id, scheduled_count_per_day, preferred_model, word_count_target, vertical_focus, keywords, brand_tone, writing_style, blog_components, custom_instructions",
      )
      .eq("daily_schedule_enabled", true)

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    if (!users || users.length === 0) {
      return { success: true, message: "No users with scheduled generation enabled" }
    }

    let totalGenerated = 0

    // Process each user
    for (const user of users) {
      try {
        const userId = user.user_id
        const count = user.scheduled_count_per_day || 1
        const model = user.preferred_model || "mistralai/Mistral-Small-24B-Instruct-2501"
        const wordCount = user.word_count_target || 2500
        const verticals = user.vertical_focus || ["General"]
        const keywords = user.keywords || ["general information"]
        const tone = user.brand_tone || "Professional"
        const style = user.writing_style || "Clear and concise"
        const components = user.blog_components || { intro: true, stats: true, cta: true }
        const customInstructions = user.custom_instructions || ""

        // Generate blogs for this user
        for (let i = 0; i < count; i++) {
          // Randomly select a vertical and keyword
          const vertical = verticals[Math.floor(Math.random() * verticals.length)]
          const keyword = keywords[Math.floor(Math.random() * keywords.length)]

          // Build prompt
          const prompt = buildBlogPrompt(vertical, keyword, tone, style, wordCount, components, customInstructions)

          // Generate content
          const generatedContent = await generateBlogContent(prompt, model)

          // Extract title and clean content
          const { title, content } = extractTitle(generatedContent)

          // Count words
          const actualWordCount = countWords(content)

          // Save blog to database
          await bloggenService.saveBlog({
            user_id: userId,
            title,
            content,
            vertical,
            keyword,
            word_count: actualWordCount,
            source: "scheduled",
            output_type: "copyable",
            is_downloaded: false,
          })

          totalGenerated++
        }

        // Log the generation
        await bloggenService.logGeneration(userId, "scheduled", count)

        // Update the last run timestamp
        await supabase.from("bloggen_presets").update({ last_run_at: new Date().toISOString() }).eq("user_id", userId)
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError)
        // Continue with next user
      }
    }

    return { success: true, totalGenerated }
  } catch (error) {
    console.error("Error in scheduled generation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Wrap the generation function with operation logging
const scheduledGenerationWithLogging = withOperationLogging("bloggen-scheduled", runScheduledGeneration)

export async function GET(request: Request) {
  try {
    // Verify CRON secret key
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split("Bearer ")[1]

    if (!token || token !== CRON_SECRET_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Run scheduled generation with operation logging
    const result = await scheduledGenerationWithLogging()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in CRON endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
