"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/db"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalMappings: 0,
    verifiedMappings: 0,
    totalCorrections: 0,
    topCategories: [],
    categoryDistribution: [],
    confidenceOverTime: [],
    correctionTrends: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)

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

        // Get top categories
        const { data: categoryData } = await supabase.from("category_mappings").select("main_category, sub_category")

        const categoryCounts = {}
        categoryData?.forEach((item) => {
          const mainCategory = item.main_category

          if (!categoryCounts[mainCategory]) {
            categoryCounts[mainCategory] = 0
          }

          categoryCounts[mainCategory] += 1
        })

        const categoryDistribution = Object.entries(categoryCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)

        // Get confidence over time (simplified mock data)
        // In a real implementation, you'd query the database with time grouping
        const confidenceOverTime = [
          { date: "2023-01", ai: 0.65, database: 0.78 },
          { date: "2023-02", ai: 0.68, database: 0.79 },
          { date: "2023-03", ai: 0.72, database: 0.81 },
          { date: "2023-04", ai: 0.75, database: 0.83 },
          { date: "2023-05", ai: 0.79, database: 0.85 },
          { date: "2023-06", ai: 0.82, database: 0.87 },
        ]

        // Get correction trends (simplified mock data)
        // In a real implementation, you'd query the database with time grouping
        const correctionTrends = [
          { date: "2023-01", corrections: 45 },
          { date: "2023-02", corrections: 38 },
          { date: "2023-03", corrections: 32 },
          { date: "2023-04", corrections: 28 },
          { date: "2023-05", corrections: 22 },
          { date: "2023-06", corrections: 18 },
        ]

        setStats({
          totalMappings: totalMappings || 0,
          verifiedMappings: verifiedMappings || 0,
          totalCorrections: totalCorrections || 0,
          topCategories: categoryDistribution.slice(0, 5),
          categoryDistribution,
          confidenceOverTime,
          correctionTrends,
        })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const COLORS = ["#16783a", "#45c133", "#8696ee", "#5466b5", "#f59e0b", "#ec4899"]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Category Matching Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#16783a]">{stats.totalMappings}</h3>
            <p className="text-sm text-gray-600">Total Products Processed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#16783a]">{stats.verifiedMappings}</h3>
            <p className="text-sm text-gray-600">User-Verified Mappings</p>
          </CardContent>
        </Card>

        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#16783a]">
              {stats.totalMappings > 0 ? `${Math.round((stats.totalCorrections / stats.totalMappings) * 100)}%` : "0%"}
            </h3>
            <p className="text-sm text-gray-600">Correction Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
          <TabsTrigger value="corrections">Corrections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.categoryDistribution.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.confidenceOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0.5, 1]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="ai" stroke="#8696ee" name="AI Confidence" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="database"
                        stroke="#16783a"
                        name="Database Confidence"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryDistribution.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16783a" name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence">
          <Card>
            <CardHeader>
              <CardTitle>Confidence Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.confidenceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0.5, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ai" stroke="#8696ee" name="AI Confidence" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="database"
                      stroke="#16783a"
                      name="Database Confidence"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card>
            <CardHeader>
              <CardTitle>Correction Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.correctionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="corrections"
                      stroke="#ec4899"
                      name="User Corrections"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
