import { getServerClient } from "../supabase"
import type { PendingTask } from "@/types/database"

export class PendingTasksService {
  private supabase = getServerClient()

  /**
   * Create a new pending task
   */
  async createTask(userId: string, taskDescription: string, operationId?: string): Promise<PendingTask | null> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await this.supabase
        .from("pending_tasks")
        .insert({
          user_id: userId,
          task_description: taskDescription,
          status: "pending",
          created_at: now,
          updated_at: now,
          operation_id: operationId || null,
          result: null,
          error: null,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating pending task:", error)
        return null
      }

      return data as PendingTask
    } catch (error) {
      console.error("Error in createTask:", error)
      return null
    }
  }

  /**
   * Update a pending task status
   */
  async updateTaskStatus(
    taskId: number,
    status: PendingTask["status"],
    result?: Record<string, any> | null,
    error?: string | null,
  ): Promise<PendingTask | null> {
    try {
      const updateData: Partial<PendingTask> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (result !== undefined) {
        updateData.result = result
      }

      if (error !== undefined) {
        updateData.error = error
      }

      const { data, error: updateError } = await this.supabase
        .from("pending_tasks")
        .update(updateData)
        .eq("id", taskId)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating pending task:", updateError)
        return null
      }

      return data as PendingTask
    } catch (error) {
      console.error("Error in updateTaskStatus:", error)
      return null
    }
  }

  /**
   * Get all pending tasks for a user
   */
  async getUserPendingTasks(userId: string): Promise<PendingTask[]> {
    try {
      const { data, error } = await this.supabase
        .from("pending_tasks")
        .select("*, ai_operations:operation_id (*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching user pending tasks:", error)
        return []
      }

      return data as PendingTask[]
    } catch (error) {
      console.error("Error in getUserPendingTasks:", error)
      return []
    }
  }
}

// Create a singleton instance
let instance: PendingTasksService | null = null

export const getPendingTasksService = (): PendingTasksService => {
  if (!instance) {
    instance = new PendingTasksService()
  }
  return instance
}
