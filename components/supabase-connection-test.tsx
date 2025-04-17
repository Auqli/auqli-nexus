"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/db"

export function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error">("loading")
  const [tables, setTables] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")

  async function testConnection() {
    setConnectionStatus("loading")
    try {
      // Test the connection by making a simple query
      const { data, error } = await supabase.from("category_mappings").select("count", { count: "exact", head: true })

      if (error) {
        throw error
      }

      // Get list of tables
      const { data: tablesData, error: tablesError } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public")

      if (tablesError) {
        console.warn("Could not fetch tables:", tablesError)
      } else {
        setTables(tablesData?.map((t) => t.tablename) || [])
      }

      setConnectionStatus("success")
    } catch (error) {
      console.error("Supabase connection error:", error)
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setConnectionStatus("error")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle>Supabase Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {connectionStatus === "loading" && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#16783a]"></div>
              <p>Testing connection...</p>
            </div>
          )}

          {connectionStatus === "success" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <p className="font-medium text-green-600">Connected to Supabase successfully!</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Available Tables:</h3>
                {tables.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {tables.map((table) => (
                      <li key={table}>{table}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-600">No tables found in the public schema.</p>
                )}
              </div>

              <div className="pt-2">
                <Button onClick={testConnection} size="sm">
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                <p className="font-medium text-red-600">Connection failed</p>
              </div>

              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>

              <div className="pt-2">
                <Button onClick={testConnection} size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
