import { v4 as uuidv4 } from "uuid"
import { getServerClient } from "@/lib/supabase"

type AIToolFunction<T, R> = (params: T) => Promise<R>

export interface AIOperationLoggerOptions {
  createPendingTask?: boolean
  sessionId?: string
}

/**
 * Wraps an AI tool function with operation logging
 */
export function withOperationLogging<T, R>(
  toolSlug: string,
  toolFunction: AIToolFunction<T, R>,
  options: AIOperationLoggerOptions = {},
): AIToolFunction<T, R> {
  const { createPendingTask = false, sessionId } = options

  return async (params: T): Promise<R> => {
    const supabase = getServerClient()
    let operationId: string | null = null
    let pendingTaskId: string | null = null

    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User not authenticated:", userError)
        return toolFunction(params)
      }

      // Get the tool ID from the slug
      const { data: tool, error: toolError } = await supabase
        .from("ai_tools")
        .select("id")
        .eq("tool_slug", toolSlug)
        .single()

      if (toolError || !tool) {
        console.error(`Tool not found: ${toolSlug}`, toolError)
        return toolFunction(params)
      }

      // Log the operation
      operationId = uuidv4()
      const { error: operationError } = await supabase.from("ai_operations").insert({
        id: operationId,
        user_id: user.id,
        tool_id: tool.id,
        input_meta: params as Record<string, any>,
        session_id: sessionId || uuidv4(),
        timestamp: new Date().toISOString(),
      })

      if (operationError) {
        console.error("Error logging operation:", operationError)
      }

      // Create a pending task if requested
      if (createPendingTask && operationId) {
        pendingTaskId = uuidv4()
        const now = new Date().toISOString()

        const { error: taskError } = await supabase.from("pending_tasks").insert({
          id: pendingTaskId,
          operation_id: operationId,
          status: "processing",
          created_at: now,
          updated_at: now,
        })

        if (taskError) {
          console.error("Error creating pending task:", taskError)
        }
      }

      // Execute the tool function
      const result = await toolFunction(params)

      // Update the pending task if it was created
      if (pendingTaskId) {
        const { error: updateError } = await supabase
          .from("pending_tasks")
          .update({
            status: "completed",
            result: result as unknown as Record<string, any>,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pendingTaskId)

        if (updateError) {
          console.error("Error updating pending task:", updateError)
        }
      }

      return result
    } catch (error) {
      // Update the pending task with the error if it was created
      if (pendingTaskId) {
        await supabase
          .from("pending_tasks")
          .update({
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
            updated_at: new Date().toISOString(),
          })
          .eq("id", pendingTaskId)
      }

      throw error
    }
  }
}

/**
 * Interface for CSV conversion parameters
 */
export interface CSVConversionParams {
  csvData: string
  targetFormat: string
  includeHeaders?: boolean
  customMapping?: Record<string, string>
  userId?: string
}

/**
 * Interface for CSV conversion result
 */
export interface CSVConversionResult {
  convertedData: string
  format: string
  rowCount: number
  columnCount: number
  processingTime: number
}

/**
 * Converts CSV data to the specified format
 */
async function convertCSV(params: CSVConversionParams): Promise<CSVConversionResult> {
  const { csvData, targetFormat, includeHeaders = true, customMapping = {} } = params
  const startTime = Date.now()

  // Parse CSV data
  const rows = csvData.trim().split("\n")
  const headers = rows[0].split(",").map((header) => header.trim())
  const dataRows = includeHeaders ? rows.slice(1) : rows

  let convertedData = ""

  // Convert based on target format
  switch (targetFormat.toLowerCase()) {
    case "json":
      const jsonData = dataRows.map((row) => {
        const values = row.split(",").map((val) => val.trim())
        const obj: Record<string, string> = {}

        headers.forEach((header, index) => {
          const mappedHeader = customMapping[header] || header
          obj[mappedHeader] = values[index] || ""
        })

        return obj
      })
      convertedData = JSON.stringify(jsonData, null, 2)
      break

    case "xml":
      convertedData = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n'
      dataRows.forEach((row) => {
        const values = row.split(",").map((val) => val.trim())
        convertedData += "  <item>\n"

        headers.forEach((header, index) => {
          const mappedHeader = customMapping[header] || header
          convertedData += `    <${mappedHeader}>${values[index] || ""}</${mappedHeader}>\n`
        })

        convertedData += "  </item>\n"
      })
      convertedData += "</data>"
      break

    case "tsv":
      if (includeHeaders) {
        const mappedHeaders = headers.map((header) => customMapping[header] || header)
        convertedData += mappedHeaders.join("\t") + "\n"
      }

      dataRows.forEach((row) => {
        const values = row.split(",").map((val) => val.trim())
        convertedData += values.join("\t") + "\n"
      })
      break

    default:
      throw new Error(`Unsupported format: ${targetFormat}`)
  }

  const processingTime = Date.now() - startTime

  return {
    convertedData,
    format: targetFormat.toLowerCase(),
    rowCount: dataRows.length,
    columnCount: headers.length,
    processingTime,
  }
}

/**
 * Converts CSV data with operation logging
 */
export const convertCSVWithLogging = withOperationLogging<CSVConversionParams, CSVConversionResult>(
  "csv-converter",
  convertCSV,
  { createPendingTask: true },
)
