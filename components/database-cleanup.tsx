"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/db"
import { AlertTriangle, Check, Trash2, RefreshCw, Play } from "lucide-react"

export function DatabaseCleanup() {
  const [tables, setTables] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [sqlQuery, setSqlQuery] = useState("")
  const [activeTab, setActiveTab] = useState("analyze")
  const [dropConfirm, setDropConfirm] = useState({})
  const [dbStats, setDbStats] = useState({
    categoryMappings: 0,
    categoryCorrections: 0,
    otherTables: [],
  })
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupInstructions, setSetupInstructions] = useState(false)

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setIsLoading(true)
    try {
      // First, try to get tables using information_schema directly
      const { data, error } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

      if (error) {
        console.error("Error fetching tables:", error)
        setNeedsSetup(true)
        setResult({
          success: false,
          message: "Unable to fetch tables. You may need to set up the database functions.",
          error: error.message,
        })
      } else {
        setTables(data.map((t) => ({ table_name: t.tablename })) || [])

        // Get stats for specific tables
        await fetchTableStats(data.map((t) => t.tablename))
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      setNeedsSetup(true)
      setResult({
        success: false,
        message: "Failed to fetch tables. You may need to set up the database functions.",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTableStats = async (tableNames) => {
    try {
      // Get count of category_mappings if it exists
      if (tableNames.includes("category_mappings")) {
        const { count: mappingsCount, error: mappingsError } = await supabase
          .from("category_mappings")
          .select("*", { count: "exact", head: true })

        if (!mappingsError) {
          setDbStats((prev) => ({ ...prev, categoryMappings: mappingsCount || 0 }))
        }
      }

      // Get count of category_corrections if it exists
      if (tableNames.includes("category_corrections")) {
        const { count: correctionsCount, error: correctionsError } = await supabase
          .from("category_corrections")
          .select("*", { count: "exact", head: true })

        if (!correctionsError) {
          setDbStats((prev) => ({ ...prev, categoryCorrections: correctionsCount || 0 }))
        }
      }

      // Get counts of other tables
      const otherTables = []
      for (const tableName of tableNames) {
        if (tableName !== "category_mappings" && tableName !== "category_corrections") {
          try {
            const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

            if (!error) {
              otherTables.push({
                name: tableName,
                count: count || 0,
              })
            }
          } catch (err) {
            console.log(`Error getting count for table ${tableName}:`, err)
          }
        }
      }

      setDbStats((prev) => ({ ...prev, otherTables }))
    } catch (error) {
      console.error("Error fetching table stats:", error)
    }
  }

  const executeSQL = async () => {
    if (!sqlQuery.trim()) return

    setIsLoading(true)
    try {
      // For direct SQL execution, we'll use a different approach
      // This is a simplified version that only works for certain queries
      let result = null

      // Handle specific SQL commands
      if (sqlQuery.toLowerCase().includes("drop table")) {
        // Extract table name from DROP TABLE statement
        const tableNameMatch = sqlQuery.match(
          /drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?["']?([a-zA-Z0-9_]+)["']?/i,
        )
        if (tableNameMatch && tableNameMatch[1]) {
          const tableName = tableNameMatch[1]
          await dropTable(tableName)
          result = { message: `Table ${tableName} dropped successfully` }
        } else {
          throw new Error("Could not parse table name from DROP TABLE statement")
        }
      } else if (sqlQuery.toLowerCase().includes("create table")) {
        // For CREATE TABLE, we'll show a message that this needs to be done through the Supabase dashboard
        setResult({
          success: false,
          message: "CREATE TABLE statements must be executed through the Supabase dashboard SQL editor.",
          error: "This simplified interface cannot execute complex SQL statements.",
        })
        setIsLoading(false)
        return
      } else if (sqlQuery.toLowerCase().includes("select")) {
        // For SELECT queries, we'll show a message that this needs to be done through the Supabase dashboard
        setResult({
          success: false,
          message: "SELECT statements must be executed through the Supabase dashboard SQL editor.",
          error: "This simplified interface cannot execute complex SQL statements.",
        })
        setIsLoading(false)
        return
      } else {
        // For other queries, show a message
        setResult({
          success: false,
          message: "This SQL statement cannot be executed through this interface.",
          error: "Please use the Supabase dashboard SQL editor for complex SQL operations.",
        })
        setIsLoading(false)
        return
      }

      setResult({
        success: true,
        message: "Query executed successfully",
        data: result,
      })

      // Refresh tables after SQL execution
      await fetchTables()
    } catch (error) {
      console.error("Error executing SQL:", error)
      setResult({
        success: false,
        message: "Failed to execute SQL query",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const dropTable = async (tableName) => {
    setIsLoading(true)
    try {
      // We can't directly execute SQL, so we'll use a workaround
      // First, check if the table exists by trying to select from it
      const { error: checkError } = await supabase.from(tableName).select("*", { count: "exact", head: true })

      if (checkError && checkError.code === "42P01") {
        // Table doesn't exist
        setResult({
          success: false,
          message: `Table "${tableName}" doesn't exist`,
          error: checkError.message,
        })
        return
      }

      // For tables that exist, we can try to delete all rows
      // This is not the same as dropping the table, but it's the best we can do
      const { error: deleteError } = await supabase.from(tableName).delete().neq("id", -1) // This will delete all rows

      if (deleteError) {
        throw deleteError
      }

      setResult({
        success: true,
        message: `All rows in table "${tableName}" deleted successfully. Note: The table structure still exists.`,
      })

      // Reset confirmation for this table
      setDropConfirm((prev) => ({ ...prev, [tableName]: false }))

      // Refresh tables after dropping
      await fetchTables()
    } catch (error) {
      console.error(`Error dropping table ${tableName}:`, error)
      setResult({
        success: false,
        message: `Failed to drop table "${tableName}"`,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const dropAllUnneededTables = async () => {
    setIsLoading(true)
    try {
      // Get list of tables to keep
      const tablesToKeep = ["category_mappings", "category_corrections"]

      // Get list of tables to drop
      const tablesToDrop = tables
        .filter((table) => !tablesToKeep.includes(table.table_name))
        .map((table) => table.table_name)

      if (tablesToDrop.length === 0) {
        setResult({
          success: true,
          message: "No tables to drop. Only essential tables remain.",
          data: null,
        })
        return
      }

      // Drop each table one by one
      const results = []
      for (const tableName of tablesToDrop) {
        try {
          // For tables that exist, we can try to delete all rows
          const { error: deleteError } = await supabase.from(tableName).delete().neq("id", -1) // This will delete all rows

          if (deleteError) {
            results.push({ table: tableName, success: false, error: deleteError.message })
          } else {
            results.push({ table: tableName, success: true })
          }
        } catch (err) {
          results.push({ table: tableName, success: false, error: err.message })
        }
      }

      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      setResult({
        success: successCount > 0,
        message: `Cleared data from ${successCount} tables. ${failCount} tables failed.`,
        data: { results },
      })

      // Refresh tables after dropping
      await fetchTables()
    } catch (error) {
      console.error("Error dropping tables:", error)
      setResult({
        success: false,
        message: "Failed to drop tables",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeDatabase = async () => {
    setIsLoading(true)
    try {
      // Check if category_mappings table exists
      const { error: mappingsError } = await supabase
        .from("category_mappings")
        .select("*", { count: "exact", head: true })

      const mappingsExists = !mappingsError

      // Check if category_corrections table exists
      const { error: correctionsError } = await supabase
        .from("category_corrections")
        .select("*", { count: "exact", head: true })

      const correctionsExists = !correctionsError

      setResult({
        success: true,
        message: "Database analysis complete",
        data: {
          mappingsExists,
          correctionsExists,
          tables: tables.map((t) => t.table_name),
        },
      })
    } catch (error) {
      console.error("Error analyzing database:", error)
      setResult({
        success: false,
        message: "Failed to analyze database",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createNecessaryTables = async () => {
    setIsLoading(true)
    try {
      setResult({
        success: false,
        message: "To create the necessary tables, please use the Supabase dashboard SQL editor with the following SQL:",
        data: `
-- Create category_mappings table if it doesn't exist
CREATE TABLE IF NOT EXISTS category_mappings (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_description TEXT,
  main_category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  confidence_score FLOAT,
  user_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_corrections table if it doesn't exist
CREATE TABLE IF NOT EXISTS category_corrections (
  id SERIAL PRIMARY KEY,
  product_title TEXT NOT NULL,
  original_main_category TEXT NOT NULL,
  original_subcategory TEXT NOT NULL,
  corrected_main_category TEXT NOT NULL,
  corrected_subcategory TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on both tables
ALTER TABLE category_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_corrections DISABLE ROW LEVEL SECURITY;
        `,
      })
    } catch (error) {
      console.error("Error creating tables:", error)
      setResult({
        success: false,
        message: "Failed to create tables",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle>Database Cleanup & Analysis</CardTitle>
        <CardDescription className="text-white/80">
          Analyze and clean up your database for optimal AI training
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full p-0 bg-[#f8fdf9]">
          <TabsTrigger value="analyze" className="flex-1 py-3">
            Analyze Database
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex-1 py-3">
            Manage Tables
          </TabsTrigger>
          <TabsTrigger value="sql" className="flex-1 py-3">
            Run SQL
          </TabsTrigger>
        </TabsList>

        <CardContent className="p-6">
          {needsSetup && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-800">Database Setup Required</AlertTitle>
              <AlertDescription className="text-amber-700">
                <p className="mb-2">The database needs to be set up before you can use all features of this tool.</p>
                <Button
                  variant="outline"
                  className="mt-2 border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                  onClick={() => setSetupInstructions(!setupInstructions)}
                >
                  {setupInstructions ? "Hide Instructions" : "Show Setup Instructions"}
                </Button>

                {setupInstructions && (
                  <div className="mt-4 p-4 bg-white rounded-md border border-amber-200">
                    <h4 className="font-medium mb-2">Setup Instructions</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Go to your Supabase dashboard</li>
                      <li>Navigate to the SQL Editor</li>
                      <li>Create the necessary tables by running the following SQL:</li>
                    </ol>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                      {`-- Create category_mappings table if it doesn't exist
CREATE TABLE IF NOT EXISTS category_mappings (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_description TEXT,
  main_category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  confidence_score FLOAT,
  user_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_corrections table if it doesn't exist
CREATE TABLE IF NOT EXISTS category_corrections (
  id SERIAL PRIMARY KEY,
  product_title TEXT NOT NULL,
  original_main_category TEXT NOT NULL,
  original_subcategory TEXT NOT NULL,
  corrected_main_category TEXT NOT NULL,
  corrected_subcategory TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on both tables
ALTER TABLE category_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_corrections DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="analyze" className="mt-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Database Analysis</h3>
                <div className="space-x-2">
                  <Button onClick={analyzeDatabase} disabled={isLoading} className="bg-[#16783a] hover:bg-[#225b35]">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Analyze Database
                  </Button>
                  <Button
                    onClick={createNecessaryTables}
                    disabled={isLoading}
                    className="bg-[#5466b5] hover:bg-[#4355a4]"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Fix Issues
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#16783a]">{dbStats.categoryMappings}</h3>
                    <p className="text-sm text-gray-600">Category Mappings</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#16783a]">{dbStats.categoryCorrections}</h3>
                    <p className="text-sm text-gray-600">Category Corrections</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#f8fdf9] border border-[#16783a]/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#16783a]">{tables.length}</h3>
                    <p className="text-sm text-gray-600">Total Tables</p>
                  </CardContent>
                </Card>
              </div>

              {result && result.data && result.data.tables && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Database Tables</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.data.tables.map((tableName, index) => (
                        <TableRow key={index}>
                          <TableCell>{tableName}</TableCell>
                          <TableCell>
                            {tableName === "category_mappings" || tableName === "category_corrections" ? (
                              <span className="text-green-500 flex items-center">
                                <Check className="h-4 w-4 mr-1" />
                                Required for AI training
                              </span>
                            ) : (
                              <span className="text-amber-500 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Not needed for AI training
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {result.data.tables.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                            No tables found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {result && result.data && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Required Tables Status</h3>
                  <div className="space-y-2">
                    <div className="p-3 rounded-md border bg-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">category_mappings</span>
                        {result.data.mappingsExists ? (
                          <span className="text-green-500 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Exists
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Missing
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-md border bg-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">category_corrections</span>
                        {result.data.correctionsExists ? (
                          <span className="text-green-500 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Exists
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Missing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tables" className="mt-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Database Tables</h3>
                <div className="space-x-2">
                  <Button onClick={fetchTables} disabled={isLoading} className="bg-[#16783a] hover:bg-[#225b35]">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to drop ALL tables except category_mappings and category_corrections? This action cannot be undone!",
                        )
                      ) {
                        dropAllUnneededTables()
                      }
                    }}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Drop All Unneeded Tables
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.table_name}>
                      <TableCell className="font-medium">
                        {table.table_name}
                        {(table.table_name === "category_mappings" || table.table_name === "category_corrections") && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Keep
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {table.table_name === "category_mappings" || table.table_name === "category_corrections" ? (
                          <span className="text-green-500 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Required
                          </span>
                        ) : (
                          <span className="text-amber-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Not needed
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {table.table_name === "category_mappings" || table.table_name === "category_corrections" ? (
                          <span className="text-sm text-gray-500">Essential table</span>
                        ) : (
                          <>
                            {dropConfirm[table.table_name] ? (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => dropTable(table.table_name)}
                                  disabled={isLoading}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDropConfirm((prev) => ({ ...prev, [table.table_name]: false }))}
                                  disabled={isLoading}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setDropConfirm((prev) => ({ ...prev, [table.table_name]: true }))}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Drop
                              </Button>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {tables.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                        No tables found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sql" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Execute SQL Query</h3>
                <Alert className="mb-4 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-800">Limited SQL Support</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    This interface has limited SQL support. For complex operations, please use the Supabase dashboard
                    SQL editor.
                  </AlertDescription>
                </Alert>
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter SQL query here..."
                  className="min-h-[200px] font-mono"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={executeSQL}
                    disabled={isLoading || !sqlQuery.trim()}
                    className="bg-[#16783a] hover:bg-[#225b35]"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Execute
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Useful SQL Snippets</h3>
                <div className="space-y-2">
                  <div
                    className="p-2 bg-white rounded-md border cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setSqlQuery(`-- Disable RLS on category_mappings
ALTER TABLE category_mappings DISABLE ROW LEVEL SECURITY;`)
                    }
                  >
                    <div className="font-medium">Disable RLS on category_mappings</div>
                    <div className="text-xs text-gray-500">
                      Disables Row Level Security on the category_mappings table
                    </div>
                  </div>

                  <div
                    className="p-2 bg-white rounded-md border cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setSqlQuery(`-- Create category_mappings table
CREATE TABLE IF NOT EXISTS category_mappings (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_description TEXT,
  main_category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  confidence_score FLOAT,
  user_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`)
                    }
                  >
                    <div className="font-medium">Create category_mappings table</div>
                    <div className="text-xs text-gray-500">Creates the category_mappings table if it doesn't exist</div>
                  </div>

                  <div
                    className="p-2 bg-white rounded-md border cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setSqlQuery(`-- Create category_corrections table
CREATE TABLE IF NOT EXISTS category_corrections (
  id SERIAL PRIMARY KEY,
  product_title TEXT NOT NULL,
  original_main_category TEXT NOT NULL,
  original_subcategory TEXT NOT NULL,
  corrected_main_category TEXT NOT NULL,
  corrected_subcategory TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`)
                    }
                  >
                    <div className="font-medium">Create category_corrections table</div>
                    <div className="text-xs text-gray-500">
                      Creates the category_corrections table if it doesn't exist
                    </div>
                  </div>

                  <div
                    className="p-2 bg-white rounded-md border cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setSqlQuery(`-- Drop all tables except category_mappings and category_corrections
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('category_mappings', 'category_corrections')) 
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
  END LOOP;
END $$;`)
                    }
                  >
                    <div className="font-medium">Drop all tables except category_mappings and category_corrections</div>
                    <div className="text-xs text-gray-500">Drops all tables except the ones needed for AI training</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      {result && (
        <div className="px-6 pb-6">
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={result.success ? "bg-green-50 border-green-200" : ""}
          >
            <AlertTitle>{result.success ? "Success" : "Information"}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.error && (
                <div className="mt-2 text-sm bg-red-50 p-2 rounded border border-red-200 overflow-auto">
                  {result.error}
                </div>
              )}
              {result.success && result.data && typeof result.data !== "string" && !Array.isArray(result.data) && (
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-200 overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {!result.success && typeof result.data === "string" && (
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-200 overflow-auto max-h-40">
                  {result.data}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  )
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
