import { type NextRequest, NextResponse } from "next/server"
import { convertCSVWithLogging } from "@/examples/csv-converter"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { csvData, targetFormat, options } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 })
    }

    // Track the operation
    const supabase = createServerComponentClient({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Get the tool ID for CSV Converter
      const { data: toolData } = await supabase.from("ai_tools").select("id").eq("tool_slug", "converter").single()

      if (toolData) {
        // Log the operation
        await supabase.from("ai_operations").insert({
          user_id: user.id,
          tool_id: toolData.id,
          input_meta: { csvData: csvData.substring(0, 100) + "...", targetFormat, options },
          status: "success",
          timestamp: new Date().toISOString(),
        })
      }
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
