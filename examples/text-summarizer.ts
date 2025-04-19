import { withOperationLogging } from "@/lib/ai-operation-logger"

interface SummarizerParams {
  text: string
  maxLength?: number
}

interface SummarizerResult {
  summary: string
  originalLength: number
  summaryLength: number
}

// Original tool function
async function summarizeText(params: SummarizerParams): Promise<SummarizerResult> {
  const { text, maxLength = 100 } = params

  // In a real implementation, this would call an AI model
  // For demonstration, we'll just return a simple summary
  const summary = text.length > maxLength ? text.substring(0, maxLength) + "..." : text

  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
  }
}

// Wrapped version with logging
export const summarizeTextWithLogging = withOperationLogging(
  "text-summarizer", // tool_slug in the ai_tools table
  summarizeText,
  true, // Create a pending task
)

// Example usage for CSV Converter:
// const convertCSVWithLogging = withOperationLogging(
//   "converter", // tool_slug in the ai_tools table (updated from csv-converter)
//   convertCSV,
//   { createPendingTask: true }
// );
