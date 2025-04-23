"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/db"
import { Play } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function DatabaseTester() {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sqlQuery, setSqlQuery] = useState("")

  const testInsert = async () => {
    setIsLoading(true)
    try {
      // Try a simple insert
      const { data, error } = await supabase
        .from("category_mappings")
        .insert([
          {
            product_name: "Test Product " + new Date().toISOString(),
            product_description: "Test description",
            main_category: "Test Category",
            sub_category: "Test Subcategory",
            confidence_score: 1.0,
            user_verified: true,
          },
        ])
        .select()

      setTestResult({ success: !error, data, error: error?.message })
    } catch (err) {
      setTestResult({ success: false, error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const executeSQL = async () => {
    setIsLoading(true)
    setTestResult(null) // Clear previous results

    try {
      const { data, error } = await supabase.rpc("execute_sql", {
        sql_query: sqlQuery,
      })

      if (error) {
        setTestResult({ success: false, error: error.message })
      } else {
        setTestResult({ success: true, data })
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle>Database Connection Tester</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">Enter SQL Query</h3>
          <Textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="Enter SQL query here..."
            className="min-h-[100px] font-mono text-sm"
          />
        </div>

        <div className="flex space-x-4">
          <Button onClick={executeSQL} disabled={isLoading} className="bg-[#16783a] hover:bg-[#225b35]">
            <Play className="mr-2 h-4 w-4" />
            Execute SQL
          </Button>
          <Button onClick={testInsert} disabled={isLoading} className="bg-[#5466b5] hover:bg-[#4355a4]">
            Test Insert
          </Button>
        </div>

        {isLoading && <div>Loading...</div>}

        {testResult && (
          <div
            className={`p-4 rounded-md ${testResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            <h3 className="font-bold">{testResult.success ? "Success" : "Error"}</h3>
            <pre className="mt-2 text-sm overflow-auto max-h-40">
              {testResult.error || JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
