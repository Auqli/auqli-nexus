import { json } from "@remix-run/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

export const loader = async () => {
  const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
    hostName: process.env.SHOPIFY_HOST_NAME!, // Ensure this environment variable is set
  });

  const session = await shopify.session.customAppSession(process.env.SHOP!);

  const client = new shopify.rest.RestClient(session.shop, session.accessToken);

  const products = await client.get({
    path: 'products'
  });

  return json(products.body);
};
