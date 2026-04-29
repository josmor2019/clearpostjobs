import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "https://clearpostjobs.com",
  "https://www.clearpostjobs.com",
  "https://clearpostjobs.vercel.app",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
].filter(Boolean);

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          {
            key: "Access-Control-Allow-Origin",
            value: ALLOWED_ORIGINS.join(","),
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
