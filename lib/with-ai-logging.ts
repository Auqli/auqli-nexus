import { logAIOperation } from "@/app/actions/ai-operations"

type AIToolFunction<T, R> = (params: T) => Promise<R>

/**
 * Higher-order function to wrap AI tools with logging
 */
export function withAILogging<T, R>(
  toolSlug: string,
  toolFunction: AIToolFunction<T, R>,
  createPendingTask = false,
): AIToolFunction<T, R> {
  return async (params: T): Promise<R> => {
    let taskId: number | null = null
    try {
      // Log the operation
      const { success, operation, pendingTask, error } = await logAIOperation(
        toolSlug,
        params as Record<string, any>,
        createPendingTask,
      )

      if (pendingTask) {
        taskId = pendingTask.id
      }

      if (!success) {
        console.error(`Failed to log operation for ${toolSlug}:`, error)
      }

      // Execute the tool function
      const result = await toolFunction(params)

      // If we created a pending task, update its status
      if (success && taskId) {
        const { updatePendingTaskStatus } = await import("@/app/actions/ai-operations")
        await updatePendingTaskStatus(taskId, "completed", result as unknown as Record<string, any>)
      }

      return result
    } catch (error: any) {
      // If we created a pending task, update its status with the error
      if (taskId) {
        const { updatePendingTaskStatus } = await import("@/app/actions/ai-operations")
        await updatePendingTaskStatus(taskId, "failed", null, error.message)
      }

      throw error
    }
  }
}
