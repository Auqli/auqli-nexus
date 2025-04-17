import type React from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { SimpleFooter } from "@/components/simple-footer"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <SidebarNav />
      <div className="lg:ml-64 transition-all duration-300">
        <main className="p-4 md:p-6 min-h-[calc(100vh-64px)]">{children}</main>
        <SimpleFooter />
      </div>
    </div>
  )
}
