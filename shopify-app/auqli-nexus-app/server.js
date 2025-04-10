const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { createRequestHandler } = require("@remix-run/express");

// Load environment variables
dotenv.config();

// Express app
const app = express();

// CORS middleware (for your frontend)
const allowedOrigins = [
  "https://nexus.auqli.com",
  "https://auqli-dev.myshopify.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Your Custom API Route clearly defined here
app.get("/auqli-tools/account2", async (req, res) => {
  // Proxy your Remix route (which you'll set up next)
  const handler = createRequestHandler({
    build: require("./build"),
    mode: process.env.NODE_ENV,
  });

  return handler(req, res);
});

// Let Remix handle all other routes
app.all("*", createRequestHandler({
  build: require("./build"),
  mode: process.env.NODE_ENV,
}));

// Start your Express server clearly (once)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Express server running clearly on port ${PORT}`);
});
