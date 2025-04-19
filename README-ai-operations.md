# AI Operations Tracking Integration

This document explains how to integrate AI operations tracking with the existing converter tool without modifying it directly.

## Integration Options

### Option 1: Using API Route Middleware (Recommended)

The simplest way to integrate AI operations tracking with the existing converter is to use the API route middleware approach. This allows you to wrap the existing API route without modifying it.

1. Create a new file in the same directory as your existing converter API route:

\`\`\`typescript
// app/api/tools/converter/route.ts (existing file - DO NOT MODIFY)
// app/api/tools/converter/middleware.ts (new file)

import { NextRequest, NextResponse } from "next/server"
import { withAILoggingMiddleware } from "@/lib/middleware/with-ai-logging-middleware"
import { originalHandler } from "./route" // Import the original handler

// Export the wrapped handler
export const POST = withAILoggingMiddleware(
  "converter", // tool_slug in the ai_tools table
  originalHandler, // The original handler function
  true // Create a pending task
)
\`\`\`

2. Update your Next.js middleware to use this new route for the converter API:

\`\`\`typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // If the request is for the converter API, use the wrapped handler
  if (request.nextUrl.pathname === "/api/tools/converter") {
    return NextResponse.rewrite(new URL("/api/tools/converter/middleware", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/tools/converter"],
}
\`\`\`

### Option 2: Client-Side Logging

If you can't modify the API route or middleware, you can add logging on the client side:

\`\`\`typescript
// In your client-side code where you call the converter API
import { logAIOperation } from "@/app/actions/ai-operations"

async function handleConversion(data) {
  // Log the operation before calling the API
  const { success, operation, pendingTask } = await logAIOperation(
    "converter",
    data,
    true // Create a pending task
  )
  
  // Call the existing API
  const response = await fetch("/api/tools/converter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  
  const result = await response.json()
  
  // Update the pending task status
  if (pendingTask) {
    const { updatePendingTaskStatus } = await import("@/app/actions/ai-operations")
    await updatePendingTaskStatus(
      pendingTask.id,
      response.ok ? "completed" : "failed",
      response.ok ? result : null,
      !response.ok ? result.error : null
    )
  }
  
  return result
}
\`\`\`

## Important Notes

1. Do not modify the existing converter code
2. The tool slug in the database should be "converter" to match the existing URL path
3. Choose the integration option that works best for your architecture
\`\`\`

Let's also create a dashboard component to display AI operations for the converter tool specifically:
