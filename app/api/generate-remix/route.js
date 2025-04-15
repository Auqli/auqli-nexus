import { NextResponse } from "next/server"

export async function POST(request) {
  // Simplest possible implementation
  return NextResponse.json({
    images: ["https://placeholder.com/image1.jpg"],
    status: "success",
  })
}
