/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // Isolate verification builds from a running development server.
  distDir: process.env.MONA_BUILD_DIR || ".next",
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // Trusted CDN and store domains only (prevents arbitrary remote image SSRF and resource exhaustion)
    remotePatterns: [
      { protocol: "https", hostname: "oss.sazito.com" },
      { protocol: "https", hostname: "*.sazito.com" },
      { protocol: "https", hostname: "*.arvancdn.ir" },
      { protocol: "https", hostname: "*.arvancdn.com" },
      { protocol: "https", hostname: "monawear.ir" },
      { protocol: "https", hostname: "*.monawear.ir" },
    ],
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/products/:slug*",
        destination: "/product/:slug*",
        permanent: false,
      },
      {
        source: "/راهنمای-سایزبندی",
        destination: "/size-guide",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};
export default nextConfig;
