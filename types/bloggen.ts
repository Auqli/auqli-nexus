export interface Blog {
  id: string
  user_id: string
  title: string
  content: string
  vertical: string | null
  keyword: string | null
  word_count: number | null
  source: "manual" | "scheduled"
  created_at: string
  output_type: "copyable" | "downloadable" | null
  is_downloaded: boolean
  download_format: string | null
}

export interface BloggenPreset {
  id: string
  user_id: string
  brand_tone: string | null
  writing_style: string | null
  blog_components: {
    intro: boolean
    cta: boolean
    stats: boolean
    [key: string]: boolean
  }
  reference_links: string[]
  vertical_focus: string[]
  keywords: string[]
  word_count_target: number
  preferred_model: string
  daily_schedule_enabled: boolean
  scheduled_count_per_day: number
  created_at: string
  updated_at: string
}

export interface GenerationLog {
  id: string
  user_id: string
  trigger_type: "manual" | "scheduled"
  count: number
  timestamp: string
}

export interface BlogGenerationRequest {
  vertical?: string
  keyword?: string
  count?: number
  model?: string
  overridePreset?: boolean
  customTone?: string
  customStyle?: string
  customWordCount?: number
  customComponents?: {
    intro: boolean
    cta: boolean
    stats: boolean
    [key: string]: boolean
  }
}

export interface BlogGenerationResponse {
  success: boolean
  blogs?: Blog[]
  error?: string
  operationId?: string
}
