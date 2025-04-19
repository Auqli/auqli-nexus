import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getBloggenService } from "@/lib/services/bloggen-service"
import type { BloggenPreset } from "@/types/bloggen"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user's preset
    const bloggenService = getBloggenService()
    const preset = await bloggenService.getUserPreset(user.id)

    if (!preset) {
      return NextResponse.json({ success: false, error: "Failed to get user preset" }, { status: 500 })
    }

    return NextResponse.json({ success: true, preset })
  } catch (error) {
    console.error("Error fetching preset:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const presetUpdates: Partial<BloggenPreset> = await request.json()

    // Update user's preset
    const bloggenService = getBloggenService()
    const updatedPreset = await bloggenService.updateUserPreset(user.id, presetUpdates)

    if (!updatedPreset) {
      return NextResponse.json({ success: false, error: "Failed to update preset" }, { status: 500 })
    }

    return NextResponse.json({ success: true, preset: updatedPreset })
  } catch (error) {
    console.error("Error updating preset:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
