import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// List of paths that require authentication
const PROTECTED_PATHS = [
  "/converter",
  "/copygen",
  "/imagegen",
  "/bloggen",
  "/captiongen",
  "/voiceblog",
  "/clipslash",
  "/ideaspark",
  "/cvboost",
  "/threadgen",
  "/dashboard",
]

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the path requires authentication
  const path = request.nextUrl.pathname
  const isProtectedPath = PROTECTED_PATHS.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  // If accessing a protected route without a session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("redirect", path)
    // Store the redirect URL in a cookie
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("redirectAfterLogin", path, {
      httpOnly: true,
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })
    return response
  }

  // If accessing the login page with a session, redirect to the dashboard
  if (request.nextUrl.pathname === "/auth/login" && session) {
    // Check for the redirect URL in the cookie
    const redirectAfterLogin = request.cookies.get("redirectAfterLogin")?.value
    const redirectPath = redirectAfterLogin || "/dashboard"

    // Clear the cookie
    const response = NextResponse.redirect(new URL(redirectPath, request.url))
    response.cookies.delete("redirectAfterLogin")
    return response
  }

  return NextResponse.next()
}

// Specify which paths this middleware should run for
export const config = {
  matcher: [
    "/converter/:path*",
    "/copygen/:path*",
    "/imagegen/:path*",
    "/bloggen/:path*",
    "/captiongen/:path*",
    "/voiceblog/:path*",
    "/clipslash/:path*",
    "/ideaspark/:path*",
    "/cvboost/:path*",
    "/threadgen/:path*",
    "/dashboard/:path*",
    "/auth/login",
    "/converter",
    "/copygen",
    "/imagegen",
    "/bloggen",
    "/captiongen",
    "/voiceblog",
    "/clipslash",
    "/ideaspark",
    "/cvboost",
    "/threadgen",
    "/dashboard",
  ],
}
