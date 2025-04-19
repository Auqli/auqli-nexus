"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Blog } from "@/types/bloggen"

interface BlogDetailModalProps {
  blog: Blog | null
  isOpen: boolean
  onClose: () => void
  onCopy: (blog: Blog) => void
  onDownload: (blog: Blog, format: "md" | "txt") => void
}

export function BlogDetailModal({ blog, isOpen, onClose, onCopy, onDownload }: BlogDetailModalProps) {
  if (!blog) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{blog.title}</DialogTitle>
          <DialogDescription>
            {blog.vertical && `Vertical: ${blog.vertical}`}
            {blog.keyword && blog.vertical && " • "}
            {blog.keyword && `Keyword: ${blog.keyword}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-grow overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="text">Plain Text</TabsTrigger>
          </TabsList>

          <div className="flex-grow overflow-auto mt-4 border rounded-md p-4">
            <TabsContent value="preview" className="h-full overflow-auto m-0">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="markdown" className="h-full overflow-auto m-0">
              <pre className="text-sm whitespace-pre-wrap font-mono">{blog.content}</pre>
            </TabsContent>

            <TabsContent value="text" className="h-full overflow-auto m-0">
              <div className="whitespace-pre-wrap">{blog.content}</div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-between border-t pt-4 mt-4">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onCopy(blog)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>

            <div className="relative group">
              <Button variant="default" onClick={() => onDownload(blog, "md")}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <div className="absolute right-0 mt-2 w-40 bg-popover rounded-md shadow-lg overflow-hidden z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none"
                  onClick={() => onDownload(blog, "md")}
                >
                  Markdown (.md)
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none"
                  onClick={() => onDownload(blog, "txt")}
                >
                  Plain Text (.txt)
                </Button>
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
