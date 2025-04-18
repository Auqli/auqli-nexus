import { TabsTrigger } from "@/components/ui/tabs"
import { TabsList } from "@/components/ui/tabs"
import { Tabs } from "@/components/ui/tabs"
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
        <main className="p-4 md:p-6 min-h-[calc(100vh-64px)]">
          <div className="sticky top-0 z-10 bg-inherit p-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-[#1e2128] border border-gray-700 rounded-lg p-1 inline-flex">
                <TabsTrigger
                  value="overview"
                  className="text-gray-300 rounded-md px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4568DC] data-[state=active]:to-[#B06AB3] data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
