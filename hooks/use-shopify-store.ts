"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export interface ShopifyStore {
  shopName: string
  email: string
  domain: string
  country: string
  currency: string
  plan: string
  productsCount: number
  installedAt: string
}

export function useShopifyStore() {
  const [store, setStore] = useState<ShopifyStore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isEmbedded, setIsEmbedded] = useState(false)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const fetchStoreData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if we're in the Shopify embedded app context
      // by looking for shop and host query parameters
      const shop = searchParams.get("shop")

      setIsEmbedded(Boolean(shop))

      // Build the API URL
      let apiUrl = `https://auqli-nexus-be.onrender.com/api/shopify/store-info`

      // If we have a shop parameter, pass it to the API
      if (shop) {
        apiUrl += `?shop=${encodeURIComponent(shop)}`
      } else {
        // If no shop parameter, return mock data (for development/preview)
        console.log("No shop parameter provided, returning mock data")
        setStore({
          shopName: "Auqli Demo Store",
          email: "demo@auqli.live",
          domain: "demo-store.myshopify.com",
          country: "United States",
          currency: "USD",
          plan: "Shopify Plus",
          productsCount: 245,
          installedAt: "March 2023",
        })
        return
      }

      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch store data")
      }

      const data = await response.json()

      // Map the API response to the ShopifyStore interface
      const mappedStore: ShopifyStore = {
        shopName: data.shopName,
        email: data.email,
        domain: data.domain,
        country: data.country,
        currency: data.currency,
        plan: data.plan,
        productsCount: data.productsCount,
        installedAt: data.installedAt,
      }

      setStore(mappedStore)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching store data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error fetching store data",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
      // Fallback to demo data
      setStore({
        shopName: "Auqli Demo Store",
        email: "demo@auqli.live",
        domain: "demo-store.myshopify.com",
        country: "United States",
        currency: "USD",
        plan: "Shopify Plus",
        productsCount: 245,
        installedAt: "March 2023",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, toast])

  useEffect(() => {
    fetchStoreData()
    // In a real implementation, you might want to set up a refresh interval
    // const interval = setInterval(fetchStoreData, 3600000) // Refresh every hour
    // return () => clearInterval(interval)
  }, [fetchStoreData])

  return {
    store,
    isLoading,
    error,
    lastUpdated,
    refreshStore: fetchStoreData,
    isEmbedded,
  }
}
