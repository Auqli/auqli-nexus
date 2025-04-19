"use client"

import { useState } from "react"
import { format } from "date-fns"
import { FileText, Eye, Calendar, Tag, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Blog } from "@/types/bloggen"

interface BlogsTableProps {
  blogs: Blog[]
  onViewBlog: (blog: Blog) => void
  isLoading: boolean
}

export function BlogsTable({ blogs, onViewBlog, isLoading }: BlogsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => {
    if (sortColumn === "created_at") {
      return sortDirection === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortColumn === "word_count") {
      const aCount = a.word_count || 0
      const bCount = b.word_count || 0
      return sortDirection === "asc" ? aCount - bCount : bCount - aCount
    }
    return 0
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()

    if (isToday) {
      return `Today, ${format(date, "h:mm a")}`
    } else if (isYesterday) {
      return `Yesterday, ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No blogs generated yet</h3>
        <p className="text-gray-500 mt-2">Generate your first blog to see it here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("word_count")}>
              <div className="flex items-center">
                <span>Words</span>
                {sortColumn === "word_count" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </div>
            </TableHead>
            <TableHead>Vertical</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
              <div className="flex items-center">
                <span>Created</span>
                {sortColumn === "created_at" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBlogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell className="font-medium">{blog.title}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  {blog.word_count || "N/A"}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center w-fit">
                  <Tag className="h-3 w-3 mr-1" />
                  {blog.vertical || "General"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={blog.source === "manual" ? "default" : "secondary"} className="capitalize">
                  {blog.source}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(blog.created_at)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewBlog(blog)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
