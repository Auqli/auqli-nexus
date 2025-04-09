"use client"

import { useState } from "react"
import { RefreshCw, Store, Mail, Globe, Calendar, DollarSign, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useShopifyStore } from "@/hooks/use-shopify-store"

export function StoreInfoCard() {
  const { store, isLoading, error, lastUpdated, refreshStore, isEmbedded } = useShopifyStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshStore()
    setIsRefreshing(false)
  }

  // Format the connected since date
  const formatConnectedSince = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  // Get the plan badge color
  const getPlanBadgeColor = (planName: string) => {
    const plan = planName.toLowerCase()
    if (plan.includes("plus")) return "bg-purple-600"
    if (plan.includes("advanced")) return "bg-blue-600"
    if (plan.includes("basic")) return "bg-green-600"
    return "bg-gray-600"
  }

  return (
    <div className="bg-[#1A1D24] rounded-xl p-6 border border-gray-800 shadow-lg">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 bg-gray-700" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3 bg-gray-700" />
                <div>
                  <Skeleton className="h-3 w-20 bg-gray-700 mb-1" />
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="border-gray-700 text-gray-300">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : store ? (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center">
              {/* Removed shop_image check and rendering */}
              <div className="w-12 h-12 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-4">
                <Store className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{store.shopName}</h3>
                <div className="flex items-center mt-1">
                  <Badge className={`${getPlanBadgeColor(store.plan)} text-white`}>{store.plan}</Badge>
                  {!isEmbedded && (
                    <Badge variant="outline" className="ml-2 border-yellow-500/30 text-yellow-500">
                      Demo Mode
                    </Badge>
                  )}
                  {lastUpdated && (
                    <span className="text-xs text-gray-400 ml-2">Updated {lastUpdated.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-4 md:mt-0 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
                <Store className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Store Domain</p>
                <p className="text-white font-medium">{store.domain}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
                <Mail className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{store.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
                <Globe className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Country</p>
                <p className="text-white font-medium">{store.country}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Currency</p>
                <p className="text-white font-medium">{store.currency}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
                <Package className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Products</p>
                <p className="text-white font-medium">{store.productsCount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-[#14B85F]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Connected Since</p>
                <p className="text-white font-medium">{formatConnectedSince(store.installedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400 mb-4">No store data available</p>
          <Button onClick={handleRefresh} variant="outline" className="border-gray-700 text-gray-300">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
