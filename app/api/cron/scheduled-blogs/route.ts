import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getBloggenService } from "@/lib/services/bloggen-service"
import { withOperationLogging } from "@/lib/ai-operation-logger"

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
) {
  const prompt = `You are an expert long-form blog writer for Auqli, a live shopping and e-commerce company in Africa and Southeast Asia.

Write a fully SEO-optimized blog article for the "${vertical}" category. The article should:

- Target the SEO keyword: "${keyword}"
- Be ${wordCount} words long (or close)
- Follow the brand tone: ${tone}
- Use writing style: ${style}
- Include all sections selected: ${Object.entries(components)
    .filter(([_, enabled]) => enabled)
    .map(([component]) => component)
    .join(", ")}
- Follow Auqli formatting rules: H1 title, H2 sections, hyperlinked stats, Nigerian/Filipino cultural references, no generic fluff
- Never use forbidden words: "explore", "dynamic", "in the world of", etc.
- End with a strong closing paragraph with a call to join https://join.auqli.live/waitlist

Generate a complete blog article with a compelling title.

Respond with only the complete article content.`

  return prompt
}

// Function to count words in a text
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

// Function to extract title from generated content
function extractTitle(content: string): { title: string; content: string } {
  const titleMatch = content.match(/^Title:\s*(.+?)(?:\n|$)/) || content.match(/^#\s*(.+?)(?:\n|$)/)
  let title = "Untitled Blog Post"
  let cleanContent = content

  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim()
    cleanContent = content
      .replace(/^Title:\s*(.+?)(?:\n|$)/, "")
      .replace(/^#\s*(.+?)(?:\n|$)/, "")
      .trim()
  }

  return { title, content: cleanContent }
}

// Function to randomly select an item from an array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Main function to run scheduled blog generation
async function runScheduledBlogGeneration() {
  try {
    console.log("Starting scheduled blog generation...")

    // Get all users with daily_schedule_enabled = true
    const { data: presets, error } = await supabase
      .from("bloggen_presets")
      .select("*")
      .eq("daily_schedule_enabled", true)

    if (error) {
      throw new Error(`Error fetching presets: ${error.message}`)
    }

    console.log(`Found ${presets.length} users with scheduled generation enabled`)

    // Process each user
    for (const preset of presets) {
      try {
        const userId = preset.user_id
        const count = Math.min(preset.scheduled_count_per_day || 1, 20) // Max 20 blogs per day
        const bloggenService = getBloggenService()

        console.log(`Generating ${count} blogs for user ${userId}`)

        // Generate blogs for this user
        for (let i = 0; i < count; i++) {
          try {
            // Select random vertical and keyword from user's preset
            const vertical = getRandomItem(preset.vertical_focus || ["General"])
            const keyword = getRandomItem(preset.keywords || ["general information"])
            const model = preset.preferred_model || "mistralai/Mistral-Small-24B-Instruct-2501"
            const tone = preset.brand_tone || "Professional"
            const style = preset.writing_style || "Clear and concise"
            const wordCount = preset.word_count_target || 2500
            const components = preset.blog_components || { intro: true, cta: true, stats: true }

            // Build prompt
            const prompt = buildBlogPrompt(vertical, keyword, tone, style, wordCount, components)

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

            console.log(`Generated blog "${title}" for user ${userId}`)
          } catch (blogError) {
            console.error(`Error generating blog ${i + 1} for user ${userId}:`, blogError)
            // Continue with next blog
          }
        }

        // Log the generation
        await bloggenService.logGeneration(userId, "scheduled", count)
        console.log(`Completed generation for user ${userId}`)
      } catch (userError) {
        console.error(`Error processing user ${preset.user_id}:`, userError)
        // Continue with next user
      }
    }

    return { success: true, message: `Processed ${presets.length} users with scheduled generation` }
  } catch (error) {
    console.error("Error in scheduled blog generation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Wrap with operation logging
const scheduledBlogGenerationWithLogging = withOperationLogging("scheduled_bloggen", runScheduledBlogGeneration)

export async function GET(request: Request) {
  try {
    // Check for authorization header (simple API key check)
    const authHeader = request.headers.get("authorization")
    const apiKey = process.env.CRON_SECRET_KEY

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Run scheduled blog generation with operation logging
    const result = await scheduledBlogGenerationWithLogging()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in scheduled blog generation API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
