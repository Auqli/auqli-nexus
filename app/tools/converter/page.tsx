"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function CSVConverterPage() {
  const [csvData, setCsvData] = useState("")
  const [targetFormat, setTargetFormat] = useState<"json" | "array" | "object">("json")
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [delimiter, setDelimiter] = useState(",")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!csvData.trim()) {
      setError("Please enter CSV data")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tools/converter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData,
          targetFormat,
          options: {
            headers: includeHeaders,
            delimiter,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process CSV data")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">CSV Converter</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Paste your CSV data below and configure conversion options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your CSV data here..."
              className="min-h-[200px]"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Target Format</Label>
                <Select value={targetFormat} onValueChange={(value) => setTargetFormat(value as any)}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delimiter">Delimiter</Label>
                <Select value={delimiter} onValueChange={setDelimiter}>
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Select delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="headers" checked={includeHeaders} onCheckedChange={setIncludeHeaders} />
              <Label htmlFor="headers">First row contains headers</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading || !csvData.trim()} className="w-full">
              {isLoading ? "Processing..." : "Convert CSV"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Converted data will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">{error}</div>}

            {result && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p>
                    <strong>Rows:</strong> {result.rowCount}
                  </p>
                  <p>
                    <strong>Format:</strong> {result.format}
                  </p>
                  <p>
                    <strong>Processed at:</strong> {new Date(result.processedAt).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[300px]">
                  <pre className="text-sm">{JSON.stringify(result.result, null, 2)}</pre>
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="flex items-center justify-center h-[300px] text-gray-400">No data to display</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
