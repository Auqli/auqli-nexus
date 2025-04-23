"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { RefreshCw, Database, CheckCircle, AlertTriangle, Search, Download } from "lucide-react"
import { fetchCategoryStats, fetchTopCategories, fetchRecentMappings, fetchRecentCorrections } from "@/app/actions"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMappings: 0,
    verifiedMappings: 0,
    totalCorrections: 0,
    averageConfidence: 0,
  })
  const [topCategories, setTopCategories] = useState([])
  const [recentMappings, setRecentMappings] = useState([])
  const [recentCorrections, setRecentCorrections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const COLORS = ["#16783a", "#45c133", "#5466b5", "#8696ee", "#f59e0b", "#ec4899"]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch statistics
      const statsData = await fetchCategoryStats()
      setStats(statsData)

      // Fetch top categories
      const categoriesData = await fetchTopCategories()
      setTopCategories(categoriesData)

      // Fetch recent mappings
      const mappingsData = await fetchRecentMappings()
      setRecentMappings(mappingsData)

      // Fetch recent corrections
      const correctionsData = await fetchRecentCorrections()
      setRecentCorrections(correctionsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchQuery)
  }

  const handleExportCSV = () => {
    // Implement CSV export functionality here
    console.log("Exporting data to CSV")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management Dashboard</h1>
        <Button onClick={loadDashboardData} disabled={isLoading} className="bg-[#16783a] hover:bg-[#225b35]">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Mappings</p>
                <h3 className="text-2xl font-semibold text-[#16783a]">{stats.totalMappings}</h3>
              </div>
              <Database className="h-8 w-8 text-[#16783a]/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Verified Mappings</p>
                <h3 className="text-2xl font-semibold text-[#16783a]">{stats.verifiedMappings}</h3>
              </div>
              <CheckCircle className="h-8 w-8 text-[#16783a]/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Corrections</p>
                <h3 className="text-2xl font-semibold text-[#16783a]">{stats.totalCorrections}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-[#16783a]/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Avg. Confidence</p>
                <h3 className="text-2xl font-semibold text-[#16783a]">{(stats.averageConfidence * 100).toFixed(1)}%</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#16783a]/10 flex items-center justify-center">
                <span className="text-[#16783a] font-bold">AI</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16783a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Verified", value: stats.verifiedMappings },
                      { name: "Unverified", value: stats.totalMappings - stats.verifiedMappings },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="mappings" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="mappings">Category Mappings</TabsTrigger>
            <TabsTrigger value="corrections">Category Corrections</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <TabsContent value="mappings">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Main Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMappings.length > 0 ? (
                    recentMappings.map((mapping, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{mapping.product_name}</TableCell>
                        <TableCell>{mapping.main_category}</TableCell>
                        <TableCell>{mapping.sub_category}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className="bg-[#16783a] h-2.5 rounded-full"
                                style={{ width: `${(mapping.confidence_score || 0) * 100}%` }}
                              ></div>
                            </div>
                            <span>{((mapping.confidence_score || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {mapping.user_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(mapping.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        {isLoading ? "Loading data..." : "No category mappings found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Original Category</TableHead>
                    <TableHead>Corrected Category</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCorrections.length > 0 ? (
                    recentCorrections.map((correction, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{correction.product_title}</TableCell>
                        <TableCell>
                          {correction.original_main_category} &gt; {correction.original_subcategory}
                        </TableCell>
                        <TableCell>
                          {correction.corrected_main_category} &gt; {correction.corrected_subcategory}
                        </TableCell>
                        <TableCell>{new Date(correction.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        {isLoading ? "Loading data..." : "No category corrections found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
