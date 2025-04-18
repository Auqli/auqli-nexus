import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
// Import the header component
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Auqli AI - Product Categorization",
  description: "AI-powered product categorization for e-commerce",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            {/* Include the Header component */}
            <Header />
            <div className="bg-gradient-to-br from-[#0a0f1a] to-[#16283a] min-h-screen">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
