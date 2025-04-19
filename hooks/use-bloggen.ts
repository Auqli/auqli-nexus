"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import type { Blog, BloggenPreset, BlogGenerationRequest } from "@/types/bloggen"

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
    try {
      setIsLoading(true)
      const response = await fetch("/api/bloggen/blogs")
      const data = await response.json()

      if (data.success) {
        setBlogs(data.blogs)
      } else {
        setError(data.error || "Failed to fetch blogs")
      }
    } catch (err) {
      setError("An error occurred while fetching blogs")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's preset
  const fetchPreset = async () => {
    try {
      const response = await fetch("/api/bloggen/preset")
      const data = await response.json()

      if (data.success) {
        setPreset(data.preset)
      } else {
        setError(data.error || "Failed to fetch preset")
      }
    } catch (err) {
      setError("An error occurred while fetching preset")
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
  const generateBlogs = async (params: BlogGenerationRequest) => {
    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch("/api/bloggen/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh blogs list
        await fetchBlogs()
        return data.blogs
      } else {
        setError(data.error || "Failed to generate blogs")
        return null
      }
    } catch (err) {
      setError("An error occurred while generating blogs")
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
