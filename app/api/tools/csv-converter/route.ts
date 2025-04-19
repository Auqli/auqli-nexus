import { type NextRequest, NextResponse } from "next/server"
import { withOperationLogging } from "@/lib/ai-operation-logger"

// The actual CSV conversion logic
async function convertCSV(params: {
  csvData: string
  targetFormat?: "json" | "array" | "object"
  options?: {
    headers?: boolean
    delimiter?: string
  }
}) {
  const { csvData, targetFormat = "json", options = {} } = params
  const { headers = true, delimiter = "," } = options

  // Simple CSV parsing logic (in a real app, use a robust CSV parser)
  const rows = csvData.trim().split("\n")
  const headerRow = headers ? rows[0].split(delimiter) : null
  const dataRows = headers ? rows.slice(1) : rows

  let result: any

  if (targetFormat === "array") {
    result = dataRows.map((row) => row.split(delimiter))
    if (headerRow) {
      result.unshift(headerRow)
    }
  } else if (targetFormat === "object" && headerRow) {
    result = dataRows.map((row) => {
      const values = row.split(delimiter)
      return headerRow.reduce(
        (obj, header, index) => {
          obj[header] = values[index] || ""
          return obj
        },
        {} as Record<string, string>,
      )
    })
  } else {
    // Default to JSON
    if (headerRow) {
      result = dataRows.map((row) => {
        const values = row.split(delimiter)
        return headerRow.reduce(
          (obj, header, index) => {
            obj[header] = values[index] || ""
            return obj
          },
          {} as Record<string, string>,
        )
      })
    } else {
      result = dataRows.map((row) => row.split(delimiter))
    }

    // For JSON format, we're already using objects
  }

  return {
    result,
    format: targetFormat,
    rowCount: dataRows.length,
    originalSize: csvData.length,
    processedAt: new Date().toISOString(),
  }
}

// Wrap the CSV converter with operation logging
const convertCSVWithLogging = withOperationLogging("csv-converter", convertCSV, { createPendingTask: true })

export async function POST(request: NextRequest) {
  try {
    const { csvData, targetFormat, options } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 })
    }

    const result = await convertCSVWithLogging({
      csvData,
      targetFormat,
      options,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in CSV converter:", error)
    return NextResponse.json({ error: "Failed to process CSV data" }, { status: 500 })
  }
}
