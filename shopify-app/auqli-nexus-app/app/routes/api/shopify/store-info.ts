import { json } from "@remix-run/node";
import { getSession } from "~/sessions";
import { shopifyApi } from "~/shopify.server";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    const session = await getSession(shop);

    if (!session?.accessToken) {
      return json({ error: "No session found for this shop" }, { status: 404 });
    }

    const client = new shopifyApi.clients.Rest({ session });

    const shopData = await client.get({ path: "shop" });

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
    });
  } catch (error: any) {
    console.error("Error fetching store info:", error);
    return json({ error: "Failed to fetch store info" }, { status: 500 });
  }
};
