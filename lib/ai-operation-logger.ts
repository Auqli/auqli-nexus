import { v4 as uuidv4 } from "uuid"
import { getServerClient } from "./supabase"

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
