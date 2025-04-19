"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function trackAiOperation(
  toolId: number,
  inputMeta: any = {},
  outputMeta: any = {},
  status: "success" | "error" | "pending" = "success",
) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No user found when tracking AI operation")
      return { success: false, error: "User not authenticated" }
    }

    // Insert the operation record
    const { data, error } = await supabase
      .from("ai_operations")
      .insert([
        {
          user_id: user.id,
          tool_id: toolId,
          input_meta: inputMeta,
          output_meta: outputMeta,
          status: status,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error tracking AI operation:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Exception tracking AI operation:", error)
    return { success: false, error: error.message }
  }
}
