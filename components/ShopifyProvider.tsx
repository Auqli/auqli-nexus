"use client"

import type React from "react"

// Create a simple provider that just renders children
export function ShopifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Also export as ShopifyAppProvider for backward compatibility
export const ShopifyAppProvider = ShopifyProvider
