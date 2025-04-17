export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          company_name: string | null
          job_title: string | null
          bio: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          company_name?: string | null
          job_title?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          company_name?: string | null
          job_title?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: number
          status: string
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: number
          status: string
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: number
          status?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: number
          name: string
          description: string
          price_monthly: number
          price_yearly: number
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description: string
          price_monthly: number
          price_yearly: number
          features: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price_monthly?: number
          price_yearly?: number
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
}
