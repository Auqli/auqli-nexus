import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={`${inter.className} bg-[#0a0f1a] text-white min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0f1a]/95 backdrop-blur-md shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <span className="ml-2 text-xl font-semibold text-white">Auqli Nexus</span>
              </Link>
              <nav className="flex items-center space-x-6">
                <Link href="/converter" className="text-gray-300 hover:text-white transition-colors">
                  CSV Converter
                </Link>
                <Link href="/imagegen" className="text-gray-300 hover:text-white transition-colors">
                  ImageGen AI
                </Link>
                <Link href="/copygen" className="text-gray-300 hover:text-white transition-colors">
                  CopyGen AI
                </Link>
                <Link href="/bloggen" className="text-gray-300 hover:text-white transition-colors">
                  BlogGen AI
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'