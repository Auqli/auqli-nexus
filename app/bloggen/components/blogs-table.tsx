"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Copy, Eye, MoreHorizontal, Loader2 } from "lucide-react"
import { useBloggen } from "@/hooks/use-bloggen"
import { useToast } from "@/hooks/use-toast"
import { BlogDetailModal } from "./blog-detail-modal"
import type { Blog } from "@/types/bloggen"

interface BlogsTableProps {
  blogs: Blog[]
  isLoading: boolean
  onBlogSelect: (blog: Blog) => void
}

export function BlogsTable({ blogs, isLoading, onBlogSelect }: BlogsTableProps) {
  const { downloadBlog, markBlogAsDownloaded } = useBloggen()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.vertical?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.keyword?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCopyToClipboard = async (blog: Blog) => {
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

  const handleDownload = async (blog: Blog, format: "md" | "txt") => {
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

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading blogs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No blogs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                  <TableCell>{blog.vertical || "—"}</TableCell>
                  <TableCell>{blog.keyword || "—"}</TableCell>
                  <TableCell>{blog.word_count || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={blog.source === "manual" ? "outline" : "secondary"}>
                      {blog.source === "manual" ? "Manual" : "Scheduled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(blog.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => onBlogSelect(blog)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewBlog(blog)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyToClipboard(blog)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(blog, "md")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download as Markdown
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(blog, "txt")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download as Text
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BlogDetailModal
        blog={selectedBlog}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCopy={handleCopyToClipboard}
        onDownload={handleDownload}
      />
    </div>
  )
}
