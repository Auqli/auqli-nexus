import type React from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
// import { SiteHeader } from "@/components/layout/site-header" // Import SiteHeader

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* <SiteHeader /> Remove this line */}
      <div className="lg:ml-64 transition-all duration-300">
        {" "}
        {/* Add mt-16 to create space for the header */}
        <SidebarNav />
        <main className="p-4 md:p-6 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  )
}
