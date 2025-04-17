"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/db"

export function LearningProgress() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    matchedByAI: 0,
    matchedByDatabase: 0,
    correctionRate: 0,
    learningProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)

      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Set default values when Supabase is not available
        setStats({
          totalProducts: 0,
          matchedByAI: 0,
          matchedByDatabase: 0,
          correctionRate: 0,
          learningProgress: 0,
        })
        setIsLoading(false)
        return
      }

      try {
        // Get total mappings
        const { count: totalMappings } = await supabase
          .from("category_mappings")
          .select("*", { count: "exact", head: true })

        // Get total corrections
        const { count: totalCorrections } = await supabase
          .from("category_corrections")
          .select("*", { count: "exact", head: true })

        // Calculate correction rate
        const correctionRate = totalMappings > 0 ? (totalCorrections / totalMappings) * 100 : 0

        // Calculate learning progress (simplified metric)
        // In a real system, you'd use more sophisticated metrics
        const learningProgress = Math.min(
          100,
          (totalMappings > 1000 ? 50 : totalMappings / 20) +
            (correctionRate < 10 ? 50 : 50 * (1 - (correctionRate - 10) / 90)),
        )

        setStats({
          totalProducts: totalMappings || 0,
          matchedByAI: Math.round(totalMappings * 0.7) || 0, // Simplified estimate
          matchedByDatabase: Math.round(totalMappings * 0.3) || 0, // Simplified estimate
          correctionRate,
          learningProgress,
        })
      } catch (error) {
        console.error("Error fetching learning stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle>AI Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16783a]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">System Learning</h3>
              <div className="flex items-center mb-1">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Learning Progress</span>
                    <span className="text-sm font-medium">{Math.round(stats.learningProgress)}%</span>
                  </div>
                  <Progress value={stats.learningProgress} className="h-2" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {stats.totalProducts} products processed and correction patterns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Match Sources</h3>
                <div className="bg-[#f8fdf9] p-3 rounded-lg border border-[#16783a]/20">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">AI Matching</span>
                    <span className="text-xs font-medium">{stats.matchedByAI}</span>
                  </div>
                  <Progress value={(stats.matchedByAI / stats.totalProducts) * 100} className="h-1.5 mb-2" />

                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">Database Matching</span>
                    <span className="text-xs font-medium">{stats.matchedByDatabase}</span>
                  </div>
                  <Progress value={(stats.matchedByDatabase / stats.totalProducts) * 100} className="h-1.5" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Correction Rate</h3>
                <div className="bg-[#f8fdf9] p-3 rounded-lg border border-[#16783a]/20">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">User Corrections</span>
                    <span className="text-xs font-medium">{Math.round(stats.correctionRate)}%</span>
                  </div>
                  <Progress
                    value={stats.correctionRate}
                    className={`h-1.5 ${stats.correctionRate > 20 ? "bg-amber-500" : "bg-[#16783a]"}`}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.correctionRate < 10
                      ? "Low correction rate indicates good AI performance"
                      : "Higher correction rate suggests more learning needed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
