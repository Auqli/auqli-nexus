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
      const shop = searchParams.get("shop")
      setIsEmbedded(Boolean(shop))

      // ✅ FIXED: Use correct backend path
      let apiUrl = `https://auqli-nexus-be.onrender.com/store-info`

      if (shop) {
        apiUrl += `?shop=${encodeURIComponent(shop)}`
      } else {
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

      const mappedStore: ShopifyStore = {
        shopName: data.name,
        email: data.email,
        domain: data.domain,
        country: data.country,
        currency: data.currency,
        plan: data.plan,
        productsCount: data.productsCount,
        installedAt: data.createdAt,
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
