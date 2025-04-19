import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getAIOperationsService } from "../services/ai-operations"
import { getPendingTasksService } from "../services/pending-tasks"

/**
 * Middleware to log AI operations for existing API routes
 * This can be used to wrap existing API routes without modifying them
 */
export function withAILoggingMiddleware(
  toolSlug: string,
  handler: (req: NextRequest) => Promise<NextResponse>,
  createPendingTask = false,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract input metadata from the request
    let inputMeta: Record<string, any> = {}
    let pendingTask = null
    let operationId = null

    try {
      // Clone the request to read the body without consuming it
      const clonedReq = req.clone()
      const body = await clonedReq.json()
      inputMeta = body
    } catch (error) {
      console.error("Error parsing request body:", error)
    }

    try {
      // Log the operation
      const aiOperationsService = getAIOperationsService()
      const operation = await aiOperationsService.logOperation(user.id, toolSlug, inputMeta)

      if (operation) {
        operationId = operation.id

        // Create a pending task if requested
        if (createPendingTask) {
          const pendingTasksService = getPendingTasksService()
          const taskDescription = `Processing ${toolSlug} operation`
          pendingTask = await pendingTasksService.createTask(user.id, taskDescription, operation.id)
        }
      }

      // Call the original handler
      const response = await handler(req)

      // If we created a pending task, update its status
      if (pendingTask) {
        const pendingTasksService = getPendingTasksService()

        try {
          // Clone the response to read the body without consuming it
          const clonedRes = response.clone()
          const result = await clonedRes.json()

          await pendingTasksService.updateTaskStatus(pendingTask.id, "completed", result)
        } catch (error) {
          console.error("Error updating pending task:", error)
          await pendingTasksService.updateTaskStatus(pendingTask.id, "completed")
        }
      }

      return response
    } catch (error: any) {
      console.error("Error in AI logging middleware:", error)

      // If we created a pending task, update its status with the error
      if (pendingTask) {
        const pendingTasksService = getPendingTasksService()
        await pendingTasksService.updateTaskStatus(pendingTask.id, "failed", null, error.message)
      }

      // Call the original handler to maintain the original behavior
      return handler(req)
    }
  }
}
