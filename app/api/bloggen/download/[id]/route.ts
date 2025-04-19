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

    // Get format from URL
    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "md"

    // Update the blog to mark it as downloaded
    const bloggenService = getBloggenService()
    await bloggenService.updateBlog(params.id, {
      is_downloaded: true,
      download_format: format,
      output_type: "downloadable",
    })

    // Prepare the content
    const content = data.content
    const filename = `${data.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`

    // Return the content as a downloadable file
    return new NextResponse(content, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": format === "md" ? "text/markdown" : "text/plain",
      },
    })
  } catch (error) {
    console.error("Error downloading blog:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
