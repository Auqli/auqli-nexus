"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import type { Blog, BloggenPreset } from "@/types/bloggen"

interface GenerateBlogsOptions {
  count?: number
  vertical?: string
  keyword?: string
  customTopic?: string
  wordCount?: number
  model?: string
  overridePreset?: boolean
}

export function useBloggen() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [preset, setPreset] = useState<BloggenPreset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's blogs and preset
  useEffect(() => {
    if (user) {
      fetchBlogs()
      fetchPreset()
    }
  }, [user])

  // Fetch user's blogs
  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setBlogs([
        {
          id: "1",
          title: "10 Ways to Improve Your SEO Strategy",
          content:
            "Search engine optimization (SEO) is crucial for any business looking to increase their online visibility...",
          created_at: new Date().toISOString(),
          vertical: "marketing",
          keywords: ["seo", "digital marketing", "website traffic"],
          word_count: 1200,
          model_used: "mistralai/Mistral-Small-24B-Instruct-2501",
        },
        // More sample blogs...
      ])
    } catch (err) {
      setError("Failed to fetch blogs")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's preset
  const fetchPreset = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      setPreset({
        id: "default",
        vertical_focus: ["marketing", "technology"],
        keywords: ["seo", "digital marketing", "ai"],
        word_count_target: 1500,
        preferred_model: "mistralai/Mistral-Small-24B-Instruct-2501",
        daily_schedule_enabled: true,
        scheduled_count_per_day: 3,
        scheduled_time: "09:00",
      })
    } catch (err) {
      setError("Failed to fetch preset")
      console.error(err)
    }
  }

  // Update user's preset
  const updatePreset = async (updates: Partial<BloggenPreset>) => {
    try {
      const response = await fetch("/api/bloggen/preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (data.success) {
        setPreset(data.preset)
        return data.preset
      } else {
        setError(data.error || "Failed to update preset")
        return null
      }
    } catch (err) {
      setError("An error occurred while updating preset")
      console.error(err)
      return null
    }
  }

  // Generate blogs
  const generateBlogs = async (options: GenerateBlogsOptions, onStreamUpdate?: (text: string) => void) => {
    setIsGenerating(true)
    setError(null)

    try {
      // Simulate API call with streaming
      const mockBlog = {
        id: Date.now().toString(),
        title: options.customTopic || `Blog about ${options.keyword || options.vertical || "general topic"}`,
        content: "",
        created_at: new Date().toISOString(),
        vertical: options.vertical || preset?.vertical_focus[0] || "general",
        keywords: options.keyword ? [options.keyword] : preset?.keywords || ["general"],
        word_count: options.wordCount || preset?.word_count_target || 1500,
        model_used: options.model || preset?.preferred_model || "mistralai/Mistral-Small-24B-Instruct-2501",
      }

      // Simulate streaming response
      const fullContent = `# ${mockBlog.title}\n\n## Introduction\nIn today's fast-paced digital landscape, staying ahead of the curve is essential for businesses looking to maintain a competitive edge. This blog post explores key strategies and insights related to ${mockBlog.keywords.join(", ")}.\n\n## Why This Matters\nUnderstanding the nuances of ${mockBlog.vertical} can significantly impact your business outcomes. Research shows that companies investing in these areas see a 35% increase in customer engagement and a 28% boost in conversion rates.\n\n## Key Strategies\n1. **Develop a comprehensive approach**: Start by analyzing your current position and identifying gaps in your strategy.\n2. **Leverage data-driven insights**: Use analytics to inform your decision-making process and optimize for better results.\n3. **Implement iterative improvements**: Continuously test and refine your approach based on performance metrics.\n\n## Case Studies\nSeveral leading companies have successfully implemented these strategies with remarkable results. For instance, Company X saw a 45% increase in organic traffic after revamping their ${mockBlog.keywords[0]} strategy.\n\n## Conclusion\nBy adopting these proven techniques and staying informed about industry trends, you can enhance your ${mockBlog.vertical} performance and achieve sustainable growth for your business.`

      const chunks = fullContent.split(" ")
      let currentContent = ""

      for (let i = 0; i < chunks.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50)) // Simulate network delay
        currentContent += (i > 0 ? " " : "") + chunks[i]
        mockBlog.content = currentContent

        if (onStreamUpdate) {
          onStreamUpdate(currentContent)
        }
      }

      // Add the completed blog to the list
      setBlogs((prev) => [mockBlog, ...prev])

      return { blogs: [mockBlog] }
    } catch (err) {
      setError("Failed to generate blogs")
      console.error(err)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // Download a blog
  const downloadBlog = (blogId: string, format: "md" | "txt" = "md") => {
    window.open(`/api/bloggen/download/${blogId}?format=${format}`, "_blank")
  }

  // Mark blog as downloaded
  const markBlogAsDownloaded = async (blogId: string, format: string) => {
    try {
      await fetch(`/api/bloggen/blogs/${blogId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_downloaded: true,
          download_format: format,
          output_type: "downloadable",
        }),
      })

      // Refresh blogs list
      await fetchBlogs()
    } catch (err) {
      console.error("Error marking blog as downloaded:", err)
    }
  }

  return {
    blogs,
    preset,
    isLoading,
    isGenerating,
    error,
    fetchBlogs,
    fetchPreset,
    updatePreset,
    generateBlogs,
    downloadBlog,
    markBlogAsDownloaded,
  }
}
