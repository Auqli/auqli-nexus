import { v4 as uuidv4 } from "uuid"
import { getServerClient } from "../supabase"
import type { AIOperation, AITool } from "@/types/database"

export class AIOperationsService {
  private supabase = getServerClient()

  /**
   * Log an AI tool operation
   */
  async logOperation(
    userId: string,
    toolSlug: string,
    inputMeta: Record<string, any> = {},
    sessionId?: string,
  ): Promise<AIOperation | null> {
    try {
      // Get the tool ID from the tool slug
      const { data: tool, error: toolError } = await this.supabase
        .from("ai_tools")
        .select("id")
        .eq("tool_slug", toolSlug)
        .single()

      if (toolError || !tool) {
        console.error("Error fetching tool:", toolError)
        return null
      }

      // Create a new operation record
      const operationId = uuidv4()
      const { data, error } = await this.supabase
        .from("ai_operations")
        .insert({
          id: operationId,
          user_id: userId,
          tool_id: tool.id,
          input_meta: inputMeta,
          session_id: sessionId || uuidv4(),
          timestamp: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error logging operation:", error)
        return null
      }

      return data as AIOperation
    } catch (error) {
      console.error("Error in logOperation:", error)
      return null
    }
  }

  /**
   * Get all available AI tools
   */
  async getTools(activeOnly = true): Promise<AITool[]> {
    try {
      let query = this.supabase.from("ai_tools").select("*")

      if (activeOnly) {
        query = query.eq("is_active", true)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching tools:", error)
        return []
      }

      return data as AITool[]
    } catch (error) {
      console.error("Error in getTools:", error)
      return []
    }
  }

  /**
   * Get user's tool usage statistics
   */
  async getUserToolUsage(userId: string): Promise<any[]> {
    try {
      // Since we don't have a view_user_tool_usage view, we'll create a query to get similar data
      const { data, error } = await this.supabase
        .from("ai_operations")
        .select(`
          tool_id,
          ai_tools:tool_id (name),
          count:tool_id (count),
          max_timestamp:timestamp (max)
        `)
        .eq("user_id", userId)
        .group("tool_id, ai_tools!inner(name)")

      if (error) {
        console.error("Error fetching user tool usage:", error)
        return []
      }

      // Transform the data to match the expected format
      return data.map((item) => ({
        tool_name: item.ai_tools?.name,
        usage_count: item.count,
        last_used: item.max_timestamp,
      }))
    } catch (error) {
      console.error("Error in getUserToolUsage:", error)
      return []
    }
  }

  /**
   * Get daily operations count
   */
  async getDailyOperations(): Promise<any[]> {
    try {
      // Since we don't have a view_daily_operations view, we'll create a query to get similar data
      const { data, error } = await this.supabase.rpc("get_daily_operations")

      if (error) {
        console.error("Error fetching daily operations:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getDailyOperations:", error)
      return []
    }
  }
}

// Create a singleton instance
let instance: AIOperationsService | null = null

export const getAIOperationsService = (): AIOperationsService => {
  if (!instance) {
    instance = new AIOperationsService()
  }
  return instance
}
