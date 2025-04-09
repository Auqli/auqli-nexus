import { NextResponse } from "next/server"

export async function GET() {
  // This route will be called by the server to inject the Shopify App Bridge configuration
  // into the page as a script tag, without exposing it in our client code

  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || ""

  // Generate a script that will be injected into the page
  const script = `
    window.shopifyAppBridgeConfig = {
      apiKey: "${apiKey}",
      forceRedirect: true
    };
  `

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
    },
  })
}
