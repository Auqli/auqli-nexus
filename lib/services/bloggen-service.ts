import { createClient } from "@supabase/supabase-js"
import type { Blog, BloggenPreset, GenerationLog } from "@/types/bloggen"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export class BloggenService {
  private supabase

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  // Get user's preset or create a default one if it doesn't exist
  async getUserPreset(userId: string): Promise<BloggenPreset | null> {
    const { data, error } = await this.supabase.from("bloggen_presets").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user preset:", error)
      return null
    }

    // If preset exists, return it
    if (data) {
      return data as BloggenPreset
    }

    // Create a default preset
    const defaultPreset: Partial<BloggenPreset> = {
      user_id: userId,
      brand_tone: "Professional and informative",
      writing_style: "Clear, concise, with examples",
      blog_components: { intro: true, cta: true, stats: true },
      reference_links: [],
      vertical_focus: ["General"],
      keywords: [],
      word_count_target: 2500,
      preferred_model: "mistralai/Mistral-Small-24B-Instruct-2501",
      daily_schedule_enabled: false,
      scheduled_count_per_day: 1,
    }

    const { data: newPreset, error: createError } = await this.supabase
      .from("bloggen_presets")
      .insert([defaultPreset])
      .select()
      .single()

    if (createError) {
      console.error("Error creating default preset:", createError)
      return null
    }

    return newPreset as BloggenPreset
  }

  // Update user's preset
  async updateUserPreset(userId: string, preset: Partial<BloggenPreset>): Promise<BloggenPreset | null> {
    const { data, error } = await this.supabase
      .from("bloggen_presets")
      .update({ ...preset, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user preset:", error)
      return null
    }

    return data as BloggenPreset
  }

  // Get user's blogs
  async getUserBlogs(userId: string): Promise<Blog[]> {
    const { data, error } = await this.supabase
      .from("blogs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user blogs:", error)
      return []
    }

    return data as Blog[]
  }

  // Save a blog
  async saveBlog(blog: Partial<Blog>): Promise<Blog | null> {
    const { data, error } = await this.supabase.from("blogs").insert([blog]).select().single()

    if (error) {
      console.error("Error saving blog:", error)
      return null
    }

    return data as Blog
  }

  // Update a blog
  async updateBlog(blogId: string, updates: Partial<Blog>): Promise<Blog | null> {
    const { data, error } = await this.supabase.from("blogs").update(updates).eq("id", blogId).select().single()

    if (error) {
      console.error("Error updating blog:", error)
      return null
    }

    return data as Blog
  }

  // Log a generation
  async logGeneration(
    userId: string,
    triggerType: "manual" | "scheduled",
    count: number,
  ): Promise<GenerationLog | null> {
    const { data, error } = await this.supabase
      .from("generation_logs")
      .insert([
        {
          user_id: userId,
          trigger_type: triggerType,
          count,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error logging generation:", error)
      return null
    }

    return data as GenerationLog
  }

  // Get generation stats for a user
  async getUserGenerationStats(userId: string): Promise<{ manual: number; scheduled: number; total: number }> {
    const { data, error } = await this.supabase
      .from("generation_logs")
      .select("trigger_type, count")
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching generation stats:", error)
      return { manual: 0, scheduled: 0, total: 0 }
    }

    const stats = {
      manual: 0,
      scheduled: 0,
      total: 0,
    }

    data.forEach((log: any) => {
      const count = log.count || 0
      if (log.trigger_type === "manual") {
        stats.manual += count
      } else if (log.trigger_type === "scheduled") {
        stats.scheduled += count
      }
      stats.total += count
    })

    return stats
  }
}

// Singleton instance
let bloggenServiceInstance: BloggenService | null = null

export function getBloggenService(): BloggenService {
  if (!bloggenServiceInstance) {
    bloggenServiceInstance = new BloggenService()
  }
  return bloggenServiceInstance
}
