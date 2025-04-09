"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

// This component will be included in pages that need Shopify App Bridge
export function ShopifyInitializer() {
  const searchParams = useSearchParams()
  const host = searchParams?.get("host") || ""

  useEffect(() => {
    // Only initialize if we have a host parameter
    if (!host) return

    // Create a script element to load Shopify App Bridge
    const script = document.createElement("script")
    script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js"
    script.async = true
    script.onload = () => {
      // Initialize App Bridge with data from the server
      // This approach avoids having the API key in our client code
      if (window.shopifyAppBridgeConfig) {
        const AppBridge = window.shopifyAppBridge
        const app = AppBridge.createApp(window.shopifyAppBridgeConfig)

        // Store the app instance for later use
        window.shopifyApp = app
      }
    }

    document.head.appendChild(script)

    return () => {
      // Clean up
      document.head.removeChild(script)
    }
  }, [host])

  return null
}
