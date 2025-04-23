"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/db"
import { AlertCircle, Check, Database, RefreshCw } from "lucide-react"

export function DatabaseAnalyzer() {
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [tableColumns, setTableColumns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Function to list all tables in the database
  const listTables = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public")
        .order("tablename")

      if (error) {
        console.error("Error listing tables:", error)
        setError(error.message)
      } else {
        setTables(data || [])
        setSuccess("Retrieved tables list successfully")
      }
    } catch (err) {
      console.error("Exception listing tables:", err)
      setError(`Exception: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to examine a specific table
  const examineTable = async (tableName: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setSelectedTable(tableName)

    try {
      // Get table columns
      const { data: columns, error: columnsError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable, column_default")
        .eq("table_name", tableName)
        .order("ordinal_position")

      if (columnsError) {
        setError(`Failed to get columns: ${columnsError.message}`)
      } else {
        setTableColumns(columns || [])
      }

      // Get sample data
      const { data: tableRows, error: dataError } = await supabase.from(tableName).select("*").limit(10)

      if (dataError) {
        setError(`Failed to get data: ${dataError.message}`)
      } else {
        setTableData(tableRows || [])
        setSuccess(`Examined table ${tableName} successfully`)
      }
    } catch (err) {
      console.error(`Exception examining table ${tableName}:`, err)
      setError(`Exception: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle className="flex justify-between items-center">
          <span>Database Analyzer</span>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white/20"
            onClick={listTables}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 bg-gray-50 p-4 rounded-md border">
            <h3 className="font-medium mb-2">Database Tables</h3>
            {tables.length === 0 ? (
              <Button onClick={listTables} disabled={isLoading}>
                {isLoading ? "Loading..." : "List Tables"}
              </Button>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tables.map((table, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                      selectedTable === table.tablename
                        ? "bg-[#16783a]/20 border border-[#16783a]/30"
                        : "bg-white border hover:bg-gray-100"
                    }`}
                    onClick={() => examineTable(table.tablename)}
                  >
                    <div>
                      <div className="font-medium">{table.tablename}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2 bg-gray-50 p-4 rounded-md border">
            {selectedTable ? (
              <div>
                <h3 className="font-medium mb-2">Table: {selectedTable}</h3>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Columns</h4>
                  <div className="bg-white rounded-md border overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nullable
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Default
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableColumns.map((column, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {column.column_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.data_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.is_nullable}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.column_default || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Sample Data (10 rows)</h4>
                  <div className="bg-white rounded-md border overflow-x-auto">
                    {tableData.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(tableData[0]).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((value: any, colIndex) => (
                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-gray-500">No data available</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a table to view its structure and data</p>
              </div>
            )}
          </div>
        </div>
        {(error || success) && (
          <div
            className={`mt-4 p-3 rounded-md ${error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
          >
            {error ? (
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Success</p>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
