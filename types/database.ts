export interface AITool {
  id: number
  name: string
  description: string | null
  category: string | null
  is_active: boolean
  tool_slug: string
}

export interface AIOperation {
  id: string // UUID
  user_id: string // UUID
  tool_id: number
  timestamp: string // ISO date string
  input_meta: Record<string, any> | null
  session_id: string | null // UUID
}

export interface PendingTask {
  id: number
  user_id: string // UUID
  task_description: string
  status: "pending" | "processing" | "completed" | "failed"
  created_at: string // ISO date string
  updated_at: string // ISO date string
  operation_id: string | null // UUID reference to ai_operations
  result: Record<string, any> | null
  error: string | null
}
