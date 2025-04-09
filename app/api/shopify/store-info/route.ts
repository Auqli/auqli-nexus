import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Mock data for fallback when not in Shopify context
const mockShopifyStore = {
  id: 12345678,
  name: "Auqli Demo Store",
  email: "demo@auqli.live",
  domain: "demo-store.myshopify.com",
  myshopify_domain: "demo-store.myshopify.com",
  shop_owner: "Auqli Admin",
  plan_name: "shopify_plus",
  plan_display_name: "Shopify Plus",
  currency: "USD",
  country: "US",
  country_name: "United States",
  customer_email: "demo@auqli.live",
  created_at: "2023-03-15T00:00:00Z",
  updated_at: "2023-09-01T00:00:00Z",
  products_count: 245,
  has_storefront: true,
  weight_unit: "kg",
  province: "CA",
  phone: "+1-555-555-5555",
  timezone: "America/Los_Angeles",
  iana_timezone: "America/Los_Angeles",
  force_ssl: true,
  has_discounts: true,
  has_gift_cards: true,
  setup_required: false,
  marketing_sms_consent_enabled_at_checkout: false,
}

export async function GET(request: NextRequest) {
  try {
    // Get shop and accessToken from query parameters
    // In production, these would come from session or secure storage
    const searchParams = request.nextUrl.searchParams
    const shop = searchParams.get("shop")

    // If no shop parameter, return mock data (for development/preview)
    if (!shop) {
      console.log("No shop parameter provided, returning mock data")
      return NextResponse.json(mockShopifyStore)
    }

    // In a real implementation with proper session management,
    // you would get the access token from a secure storage
    // For now, we'll use a query parameter for demonstration
    const accessToken = searchParams.get("token") // Removed the fallback to SHOPIFY_API_SECRET

    // Validate access token
    if (!accessToken) {
      console.log("Missing access token, falling back to demo data")
      return NextResponse.json(mockShopifyStore, { status: 200 }) // Return demo data instead of error
    }

    // Make the API call to Shopify
    console.log(`Fetching shop data for ${shop}`)
    const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Shopify API error:", response.status, errorText)

      // If we can't fetch from Shopify, fall back to mock data
      console.log("Falling back to mock data due to API error")
      return NextResponse.json(mockShopifyStore)
    }

    const data = await response.json()
    return NextResponse.json(data.shop)
  } catch (error) {
    console.error("Error fetching Shopify store data:", error)

    // If any error occurs, fall back to mock data
    console.log("Falling back to mock data due to error")
    return NextResponse.json(mockShopifyStore)
  }
}
