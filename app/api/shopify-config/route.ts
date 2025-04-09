import { NextResponse } from "next/server"

export async function GET() {
  // Return a simple success response without any sensitive data
  return NextResponse.json({
    success: true,
    message: "Shopify API endpoint",
  })
}
