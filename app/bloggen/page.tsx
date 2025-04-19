"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { useBloggen } from "@/hooks/use-bloggen"
import { ManualBlogForm } from "@/app/bloggen/components/manual-blog-form"
import { GeneratedContentPanel } from "@/app/bloggen/components/generated-content-panel"
import { ScheduleSettingsForm } from "@/app/bloggen/components/schedule-settings-form"
import { ScheduleStatusCard } from "@/app/bloggen/components/schedule-status-card"
import { BlogsTable } from "@/app/bloggen/components/blogs-table"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"

export default function BloggenPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { blogs, preset, isLoading, error, fetchBlogs, fetchPreset } = useBloggen()
  const [activeTab, setActiveTab] = useState("manual")
  const [selectedBlog, setSelectedBlog] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user && !isAuthLoading) {
      fetchBlogs()
      fetchPreset()
    }
  }, [user, isAuthLoading])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-lg">Loading BloggenAI...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to access BloggenAI.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleBlogSelect = (blog) => {
    setSelectedBlog(blog)
    setActiveTab("manual")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BloggenAI</h1>
        <p className="text-gray-500">Generate SEO-optimized blog content instantly or on a schedule</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manual">Manual Generation</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <ManualBlogForm preset={preset} onBlogGenerated={(blog) => setSelectedBlog(blog)} />
            </div>
            <div className="lg:col-span-7">
              <GeneratedContentPanel blog={selectedBlog} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ScheduleSettingsForm preset={preset} />
            </div>
            <div className="lg:col-span-1">
              <ScheduleStatusCard preset={preset} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Generated Blogs</CardTitle>
            <CardDescription>View, edit, and download your generated blog content</CardDescription>
          </CardHeader>
          <CardContent>
            <BlogsTable blogs={blogs} isLoading={isLoading} onBlogSelect={handleBlogSelect} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
