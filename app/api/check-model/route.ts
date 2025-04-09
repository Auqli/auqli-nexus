import { NextResponse } from "next/server"

// Get API key from environment variables
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const modelId = searchParams.get("modelId")

  if (!modelId) {
    return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
  }

  try {
    // Make a lightweight request to check if the model is available
    const response = await fetch(`https://api.deepinfra.com/v1/models/${modelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
      },
    })

    // Return whether the model is available
    return NextResponse.json({
      available: response.ok,
      modelId,
    })
  } catch (error) {
    console.error("Error checking model availability:", error)
    return NextResponse.json({
      available: false,
      modelId,
      error: "Failed to check model availability",
    })
  }
}
