"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"

export function AuqliToolsHeader() {
  const pathname = usePathname()
  const [pageTitle, setPageTitle] = useState("")

  useEffect(() => {
    // Set page title based on current path
    if (pathname === "/auqli-tools") {
      setPageTitle("Dashboard")
    } else if (pathname === "/auqli-tools/imagegen") {
      setPageTitle("ImageGen AI")
    } else if (pathname === "/auqli-tools/copygen-ai") {
      setPageTitle("CopyGen AI")
    } else if (pathname === "/auqli-tools/bloggen-ai") {
      setPageTitle("BlogGen AI")
    } else if (pathname.includes("/auqli-tools/")) {
      // Extract the last part of the path and capitalize it
      const pathParts = pathname.split("/")
      const lastPart = pathParts[pathParts.length - 1]
      setPageTitle(lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " "))
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#1A1D24] py-4 px-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Page title only - logo removed */}
          <h1 className="text-xl font-semibold text-white">{pageTitle}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 rounded-full bg-[#14B85F] flex items-center justify-center text-white font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
