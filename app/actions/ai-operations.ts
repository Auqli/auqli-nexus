"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getAIOperationsService } from "@/lib/services/ai-operations"
import { getPendingTasksService } from "@/lib/services/pending-tasks"

/**
 * Log an AI tool operation and optionally create a pending task
 */
export async function logAIOperation(
  toolSlug: string,
  inputMeta: Record<string, any> = {},
  createPendingTask = false,
  sessionId?: string,
) {
  try {
    // Get the current user
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Log the operation
    const aiOperationsService = getAIOperationsService()
    const operation = await aiOperationsService.logOperation(user.id, toolSlug, inputMeta, sessionId)

    if (!operation) {
      return { success: false, error: "Failed to log operation" }
    }

    // Create a pending task if requested
    let pendingTask = null
    if (createPendingTask) {
      const pendingTasksService = getPendingTasksService()
      const taskDescription = `Processing ${toolSlug} operation`
      pendingTask = await pendingTasksService.createTask(user.id, taskDescription, operation.id)

      if (!pendingTask) {
        return {
          success: true,
          operation,
          warning: "Operation logged but failed to create pending task",
        }
      }
    }

    return {
      success: true,
      operation,
      pendingTask,
    }
  } catch (error: any) {
    console.error("Error in logAIOperation:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update a pending task status
 */
export async function updatePendingTaskStatus(
  taskId: number,
  status: "pending" | "processing" | "completed" | "failed",
  result?: Record<string, any> | null,
  error?: string | null,
) {
  try {
    const pendingTasksService = getPendingTasksService()
    const updatedTask = await pendingTasksService.updateTaskStatus(taskId, status, result, error)

    if (!updatedTask) {
      return { success: false, error: "Failed to update task status" }
    }

    return { success: true, task: updatedTask }
  } catch (error: any) {
    console.error("Error in updatePendingTaskStatus:", error)
    return { success: false, error: error.message }
  }
}
