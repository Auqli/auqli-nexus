"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Copy, Download, X, Check, Calendar, Tag, Clock, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBloggen } from "@/hooks/use-bloggen"
import type { Blog } from "@/types/bloggen"

interface BlogDetailModalProps {
  blog: Blog
  isOpen: boolean
  onClose: () => void
}

export function BlogDetailModal({ blog, isOpen, onClose }: BlogDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { downloadBlog, markBlogAsDownloaded } = useBloggen()

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(blog.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = (format: "md" | "txt") => {
    downloadBlog(blog.id, format)
    markBlogAsDownloaded(blog.id, format)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{blog.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(blog.created_at), "MMM d, yyyy")}
              </Badge>
              {blog.vertical && (
                <Badge variant="outline" className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {blog.vertical}
                </Badge>
              )}
              {blog.keyword && (
                <Badge variant="outline" className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Keyword: {blog.keyword}
                </Badge>
              )}
              {blog.word_count && (
                <Badge variant="outline" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {blog.word_count} words
                </Badge>
              )}
              <Badge variant={blog.source === "manual" ? "default" : "secondary"} className="capitalize">
                {blog.source}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-[calc(90vh-12rem)] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {blog.content.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleDownload("md")}>
              <Download className="h-4 w-4 mr-2" />
              Download .md
            </Button>
            <Button variant="outline" onClick={() => handleDownload("txt")}>
              <Download className="h-4 w-4 mr-2" />
              Download .txt
            </Button>
          </div>
          <Button onClick={handleCopyToClipboard}>
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
