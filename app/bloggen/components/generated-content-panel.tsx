"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Copy, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBloggen } from "@/hooks/use-bloggen"
import ReactMarkdown from "react-markdown"
import type { Blog } from "@/types/bloggen"

interface GeneratedContentPanelProps {
  blog: Blog | null
}

export function GeneratedContentPanel({ blog }: GeneratedContentPanelProps) {
  const { toast } = useToast()
  const { generateBlogs, isGenerating, downloadBlog, markBlogAsDownloaded } = useBloggen()
  const [viewMode, setViewMode] = useState("preview")

  const handleCopyToClipboard = async () => {
    if (!blog) return

    try {
      await navigator.clipboard.writeText(blog.content)
      toast({
        title: "Copied to clipboard",
        description: "Blog content has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (format: "md" | "txt") => {
    if (!blog) return

    try {
      downloadBlog(blog.id, format)
      await markBlogAsDownloaded(blog.id, format)
      toast({
        title: "Download started",
        description: `Your blog is being downloaded as a ${format.toUpperCase()} file.`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download blog content.",
        variant: "destructive",
      })
    }
  }

  const handleRegenerate = async () => {
    if (!blog) return

    try {
      const params = {
        vertical: blog.vertical,
        keyword: blog.keyword,
        count: 1,
      }

      await generateBlogs(params)
      toast({
        title: "Regenerating blog",
        description: "Your blog is being regenerated with the same parameters.",
      })
    } catch (error) {
      toast({
        title: "Regeneration failed",
        description: error.message || "Failed to regenerate blog post.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
        <CardDescription>Preview and manage your generated blog post</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {!blog ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-20"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">No Content Generated Yet</p>
            <p>
              Use the form on the left to generate a new blog post, or select an existing blog from the table below.
            </p>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Generating Blog Content</p>
            <p className="text-muted-foreground text-center mt-2">
              This may take a minute or two depending on the length and complexity.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <Tabs value={viewMode} onValueChange={setViewMode} className="mb-4">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-grow overflow-auto border rounded-md p-4">
              <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>

              {viewMode === "preview" && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>
              )}

              {viewMode === "markdown" && <pre className="text-sm whitespace-pre-wrap font-mono">{blog.content}</pre>}

              {viewMode === "text" && <div className="whitespace-pre-wrap">{blog.content}</div>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={handleRegenerate} disabled={!blog || isGenerating}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCopyToClipboard} disabled={!blog || isGenerating}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>

          <div className="relative group">
            <Button variant="default" disabled={!blog || isGenerating} onClick={() => handleDownload("md")}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>

            <div className="absolute right-0 mt-2 w-40 bg-popover rounded-md shadow-lg overflow-hidden z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-none"
                onClick={() => handleDownload("md")}
              >
                Markdown (.md)
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-none"
                onClick={() => handleDownload("txt")}
              >
                Plain Text (.txt)
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
