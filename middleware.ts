import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Middleware logic temporarily disabled for development and testing
  // Will be re-enabled with proper session checks before going live

  /*
  const { pathname, searchParams } = request.nextUrl

  if (pathname.startsWith("/auqli-tools")) {
    const shop = searchParams.get("shop")
    const host = searchParams.get("host")

    if (!shop || !host) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }
  */

  return NextResponse.next()
}

// Matcher also temporarily disabled
export const config = {
  // matcher: ["/auqli-tools/:path*"],
  matcher: [], // Empty matcher means middleware won't run on any routes
}
