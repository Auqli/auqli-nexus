import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

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
    const { data: blog, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 })
    }

    // Get format from query params
    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "md"

    // Prepare content
    let content = blog.content
    let filename = `${blog.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`
    let contentType = ""

    if (format === "md") {
      filename += ".md"
      contentType = "text/markdown"
    } else {
      // For txt format, strip markdown
      content = content
        .replace(/#{1,6}\s+/g, "") // Remove headings
        .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.+?)\*/g, "$1") // Remove italic
        .replace(/\[(.+?)\]$$(.+?)$$/g, "$1 ($2)") // Convert links
        .replace(/!\[(.+?)\]$$(.+?)$$/g, "[Image: $1]") // Convert images
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks
        .replace(/`(.+?)`/g, "$1") // Remove inline code
        .replace(/^\s*[-*+]\s+/gm, "• ") // Convert bullet lists
        .replace(/^\s*\d+\.\s+/gm, "$& ") // Format numbered lists
        .replace(/\n{3,}/g, "\n\n") // Normalize line breaks

      filename += ".txt"
      contentType = "text/plain"
    }

    // Update blog as downloaded
    await supabase
      .from("blogs")
      .update({
        is_downloaded: true,
        download_format: format,
        output_type: "downloadable",
      })
      .eq("id", params.id)

    // Return the file
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
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
