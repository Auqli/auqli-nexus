"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/db"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function DatabaseInsights() {
  const [stats, setStats] = useState({
    totalMappings: 0,
    verifiedMappings: 0,
    totalCorrections: 0,
    topCategories: [],
    averageConfidence: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)

      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Set default values when Supabase is not available
        setStats({
          totalMappings: 0,
          verifiedMappings: 0,
          totalCorrections: 0,
          topCategories: [],
          averageConfidence: 0,
        })
        setIsLoading(false)
        return
      }

      try {
        // Get total mappings
        const { count: totalMappings } = await supabase
          .from("category_mappings")
          .select("*", { count: "exact", head: true })

        // Get verified mappings
        const { count: verifiedMappings } = await supabase
          .from("category_mappings")
          .select("*", { count: "exact", head: true })
          .eq("user_verified", true)

        // Get total corrections
        const { count: totalCorrections } = await supabase
          .from("category_corrections")
          .select("*", { count: "exact", head: true })

        // Get average confidence
        const { data: confidenceData } = await supabase.from("category_mappings").select("confidence_score")

        const avgConfidence =
          confidenceData?.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / (confidenceData?.length || 1)

        // Get top categories
        const { data: categoryData } = await supabase.from("category_mappings").select("main_category, sub_category")

        const categoryCounts = {}
        categoryData?.forEach((item) => {
          const key = `${item.main_category} > ${item.sub_category}`
          categoryCounts[key] = (categoryCounts[key] || 0) + 1
        })

        const topCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setStats({
          totalMappings: totalMappings || 0,
          verifiedMappings: verifiedMappings || 0,
          totalCorrections: totalCorrections || 0,
          topCategories,
          averageConfidence: avgConfidence || 0,
        })
      } catch (error) {
        console.error("Error fetching database stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle>Database Insights</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16783a]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#f8fdf9] p-4 rounded-lg border border-[#16783a]/20">
                <h3 className="text-lg font-semibold text-[#16783a]">{stats.totalMappings}</h3>
                <p className="text-sm text-gray-600">Total Category Mappings</p>
              </div>
              <div className="bg-[#f8fdf9] p-4 rounded-lg border border-[#16783a]/20">
                <h3 className="text-lg font-semibold text-[#16783a]">{stats.verifiedMappings}</h3>
                <p className="text-sm text-gray-600">User-Verified Mappings</p>
              </div>
              <div className="bg-[#f8fdf9] p-4 rounded-lg border border-[#16783a]/20">
                <h3 className="text-lg font-semibold text-[#16783a]">{stats.totalCorrections}</h3>
                <p className="text-sm text-gray-600">AI Corrections Made</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Top Categories</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topCategories}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16783a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">AI Confidence</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#16783a] h-2.5 rounded-full"
                    style={{ width: `${stats.averageConfidence * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm">{Math.round(stats.averageConfidence * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
