"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { usePathname } from "next/navigation"
// Import the header component
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            {/* Conditionally render the Header component */}
            {usePathname() !== "/dashboard" && <Header />}
            <div className="bg-gradient-to-br from-[#0a0f1a] to-[#16283a] min-h-screen">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
