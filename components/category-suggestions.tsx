"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategorySuggestions } from "@/app/actions"

export function CategorySuggestions({ productName, onSelectCategory }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchSuggestions() {
      if (!productName || productName.trim() === "") return

      setIsLoading(true)
      try {
        // Check if we have a valid database connection
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.log("Supabase credentials missing. Using demo suggestions.")
          // Set demo suggestions based on the product name
          const demoSuggestions = [
            {
              mainCategory: "Fashion",
              subCategory: "T-Shirts",
              count: 12,
              confidence: 0.85,
            },
            {
              mainCategory: "Fashion",
              subCategory: "Casual Wear",
              count: 8,
              confidence: 0.72,
            },
            {
              mainCategory: "Apparel & Accessories",
              subCategory: "Men's Clothing",
              count: 5,
              confidence: 0.68,
            },
          ]

          setSuggestions(demoSuggestions)
          setIsLoading(false)
          return
        }

        // Original code to fetch suggestions
        const result = await getCategorySuggestions(productName)
        if (result.success) {
          setSuggestions(result.suggestions)
        } else {
          // Handle error case
          setSuggestions([])
          console.warn("Could not fetch category suggestions:", result.error)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [productName])

  if (isLoading) {
    return (
      <Card className="border shadow-md overflow-hidden rounded-md">
        <CardHeader className="bg-[#16783a] text-white p-4">
          <CardTitle className="text-base">Similar Products</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#16783a]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card className="border shadow-md overflow-hidden rounded-md">
        <CardHeader className="bg-[#16783a] text-white p-4">
          <CardTitle className="text-base">Similar Products</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">No similar products found in database</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-4">
        <CardTitle className="text-base">Similar Products</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-[#f8fdf9] p-3 rounded-lg border border-[#16783a]/20 hover:border-[#16783a]/50 cursor-pointer"
              onClick={() => onSelectCategory(suggestion.mainCategory, suggestion.subCategory)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#16783a]">
                    {suggestion.mainCategory} &gt; {suggestion.subCategory}
                  </p>
                  <p className="text-xs text-gray-500">Found in {suggestion.count} similar products</p>
                </div>
                <div className="text-xs bg-[#16783a]/10 text-[#16783a] px-2 py-1 rounded-full">
                  {Math.round(suggestion.confidence * 100)}% match
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
