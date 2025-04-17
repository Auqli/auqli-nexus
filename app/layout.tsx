import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/layout/site-header" // Add this import

export const metadata: Metadata = {
  title: "Auqli Nexus",
  description: "AI-powered tools for creators and sellers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`bg-[#0a0f1a] text-white min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <SiteHeader /> {/* Add the SiteHeader component here */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'