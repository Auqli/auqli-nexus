/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true, // Re-enable SWC minification since we're removing Babel
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    return config
  },
}

module.exports = nextConfig
