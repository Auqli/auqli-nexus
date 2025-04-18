import type React from "react"

export const metadata = {
  title: "Auqli AI - Product Categorization",
  description: "AI-powered product categorization for e-commerce",
    generator: 'v0.dev'
}

import ClientLayout from "./client-layout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'