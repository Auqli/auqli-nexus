import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getBloggenService } from "@/lib/services/bloggen-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Get the blog
    const { data, error } = await supabase.from("blogs").select("*").eq("id", params.id).eq("user_id", user.id).single()

    if (error) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, blog: data })
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    const updates = await request.json()

    // Update the blog
    const bloggenService = getBloggenService()
    const updatedBlog = await bloggenService.updateBlog(params.id, updates)

    if (!updatedBlog) {
      return NextResponse.json({ success: false, error: "Failed to update blog" }, { status: 500 })
    }

    return NextResponse.json({ success: true, blog: updatedBlog })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
