"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBloggen } from "@/hooks/use-bloggen"
import { BlogsTable } from "@/components/bloggen/blogs-table"
import { ManualGenerationPanel } from "@/components/bloggen/manual-generation-panel"
import { BlogGenerationView } from "@/components/bloggen/blog-generation-view"
import { ScheduledStatusBox } from "@/components/bloggen/scheduled-status-box"
import { BlogDetailModal } from "@/components/bloggen/blog-detail-modal"
import { useToast } from "@/hooks/use-toast"
import type { Blog } from "@/types/bloggen"

export default function BloggenPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const { blogs, preset, isLoading, isGenerating, fetchBlogs, fetchPreset } = useBloggen()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoaded(true)
    fetchBlogs()
    fetchPreset()
  }, [])

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsDetailModalOpen(true)
  }

  const handleBlogGenerated = () => {
    fetchBlogs()
    toast({
      title: "Blogs Generated",
      description: "Your blogs have been successfully generated.",
      variant: "success",
    })
  }

  const handleStreamUpdate = (text: string) => {
    setGeneratedContent(text)
  }

  const handleRegenerate = () => {
    // Clear the current content
    setGeneratedContent("")
    // Trigger the generation process again
    // This would typically call the same function that was used to generate initially
    toast({
      title: "Regenerating Content",
      description: "Starting a new generation with the same parameters.",
      variant: "default",
    })
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#1A1D24] to-[#1A1D24]/70 rounded-xl p-8 border border-gray-800 shadow-lg w-full text-center relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-60"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">BloggenAI: Your Personalized AI Blog Writer</h1>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Generate SEO-rich blogs instantly or on autopilot. Tailored to your brand. No fluff. Just results.
            </p>

            {preset?.daily_schedule_enabled && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>Auto-generation ON (⏰ {preset.scheduled_count_per_day} blogs/day scheduled)</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Generation Controls */}
          <div>
            <ManualGenerationPanel
              onBlogGenerated={handleBlogGenerated}
              preset={preset}
              onStreamUpdate={handleStreamUpdate}
            />
            <div className="mt-8">
              <ScheduledStatusBox preset={preset} />
            </div>
          </div>

          {/* Right Column - Real-time Generation View */}
          <div>
            <BlogGenerationView
              generatedContent={generatedContent}
              isGenerating={isGenerating}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>

        {/* Recent Blogs Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Recently Generated Blogs
            </CardTitle>
            <CardDescription>Your 5 most recent blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <BlogsTable blogs={blogs.slice(0, 5)} onViewBlog={handleViewBlog} isLoading={isLoading} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <BlogDetailModal blog={selectedBlog} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
      )}
    </div>
  )
}
