import { json } from "@remix-run/node"
import { shopifyApi } from "~/shopify.server"

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  const shop = url.searchParams.get("shop")

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 })
  }

  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return json({ error: "Missing authorization token" }, { status: 401 })
  }

  try {
    // ✅ Proper manual session object
    const session = {
      id: `offline_${shop}`,
      shop,
      state: "",
      isOnline: false,
      scope: process.env.SCOPES || "",
      accessToken: token,
      expires: undefined,
      onlineAccessInfo: undefined,
      sessionToken: token,
    }

    const client = new shopifyApi.clients.Rest({ session })

    const shopData = await client.get({ path: "shop" })

    return json({
      name: shopData.body.shop.name,
      email: shopData.body.shop.email,
      domain: shopData.body.shop.domain,
      myshopifyDomain: shopData.body.shop.myshopify_domain,
      currency: shopData.body.shop.currency,
      country: shopData.body.shop.country_name,
      plan: shopData.body.shop.plan_display_name,
      createdAt: shopData.body.shop.created_at,
      productsCount: shopData.body.shop.product_count || 0,
    })
  } catch (error: any) {
    console.error("Error fetching store info:", error)
    return json({ error: "Failed to fetch store info" }, { status: 500 })
  }
}
