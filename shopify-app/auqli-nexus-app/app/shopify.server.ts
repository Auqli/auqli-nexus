import "@shopify/shopify-app-remix/adapters/node";
import cors from "cors";
import express from "express";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// ✅ Set up Express App
const app = express();
const allowedOrigins = [
  "https://nexus.auqli.com",
  "https://auqli-nexus.be.onrender.com",
  "https://YOUR-STORE.myshopify.com", // Replace with your actual store domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

// ✅ Your FULL account2 route, fetching **real Shopify data**
app.get("/auqli-tools/account2", async (req, res) => {
  try {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).json({ success: false, error: "Missing shop parameter" });
    }

    // 1️⃣ Retrieve session from DB (Prisma)
    const session = await prisma.session.findFirst({
      where: { shop },
    });

    if (!session || !session.accessToken) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const client = new shopify.api.clients.Rest({
      session: {
        id: session.id,
        shop: session.shop,
        accessToken: session.accessToken,
        isOnline: true,
      },
    });

    // 2️⃣ Fetch store info (shop details)
    const shopResponse = await client.get({ path: "shop" });
    const shopData = shopResponse.body.shop;

    // 3️⃣ Fetch product count
    const productResponse = await client.get({ path: "products/count" });
    const productCount = productResponse.body.count;

    // 4️⃣ Build response
    const responseData = {
      success: true,
      data: {
        storeDomain: shopData.myshopify_domain,
        email: shopData.email,
        country: shopData.country_name,
        products: productCount,
        connectedSince: new Date(session.createdAt).toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
      },
    };

    res.json(responseData);
  } catch (error: any) {
    console.error("Error in /auqli-tools/account2:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Export shopify app
export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const shopifyApi = shopify.api;
