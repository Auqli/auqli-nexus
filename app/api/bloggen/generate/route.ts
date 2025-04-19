import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getBloggenService } from "@/lib/services/bloggen-service"
import { withOperationLogging } from "@/lib/ai-operation-logger"
import type { BlogGenerationRequest } from "@/types/bloggen"

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

// Main generation function that will be wrapped with operation logging
async function generateBlog(params: BlogGenerationRequest, userId: string) {
  try {
    const bloggenService = getBloggenService()

    // Get user's preset
    const preset = await bloggenService.getUserPreset(userId)
    if (!preset) {
      return { success: false, error: "Failed to get user preset" }
    }

    // Determine parameters to use (override or use preset)
    const vertical = params.vertical || preset.vertical_focus[0] || "General"
    const keyword = params.keyword || (preset.keywords.length > 0 ? preset.keywords[0] : "general information")
    const model = params.model || preset.preferred_model
    const tone = params.overridePreset && params.customTone ? params.customTone : preset.brand_tone || "Professional"
    const style =
      params.overridePreset && params.customStyle ? params.customStyle : preset.writing_style || "Clear and concise"
    const wordCount =
      params.overridePreset && params.customWordCount ? params.customWordCount : preset.word_count_target
    const components =
      params.overridePreset && params.customComponents ? params.customComponents : preset.blog_components

    // Number of blogs to generate (default to 1, max 10 for manual generation)
    const count = Math.min(params.count || 1, 10)

    // Generate blogs
    const blogs = []
    for (let i = 0; i < count; i++) {
      // Build prompt
      const prompt = buildBlogPrompt(vertical, keyword, tone, style, wordCount, components)

      // Generate content
      const generatedContent = await generateBlogContent(prompt, model)

      // Extract title and clean content
      const { title, content } = extractTitle(generatedContent)

      // Count words
      const actualWordCount = countWords(content)

      // Save blog to database
      const blog = await bloggenService.saveBlog({
        user_id: userId,
        title,
        content,
        vertical,
        keyword,
        word_count: actualWordCount,
        source: "manual",
        output_type: "copyable",
        is_downloaded: false,
      })

      if (blog) {
        blogs.push(blog)
      }
    }

    // Log the generation
    await bloggenService.logGeneration(userId, "manual", blogs.length)

    return { success: true, blogs }
  } catch (error) {
    console.error("Error generating blog:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Wrap the generation function with operation logging
const generateBlogWithLogging = withOperationLogging("bloggen", generateBlog)

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const params: BlogGenerationRequest = await request.json()

    // Generate blog with operation logging
    const result = await generateBlogWithLogging(params, user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in blog generation API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
