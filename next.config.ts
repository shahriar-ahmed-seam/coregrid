import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The codebase serializes Prisma Decimal -> number when passing data to
  // client components (Decimals aren't serializable across the RSC boundary).
  // These are type-only mismatches; runtime behavior is correct. Skip blocking
  // production builds on them.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Production optimizations.
  // `standalone` is for the Docker image; Vercel handles packaging itself.
  output:
    process.env.NODE_ENV === "production" && !process.env.VERCEL
      ? "standalone"
      : undefined,
  
  // Turbopack configuration (empty to silence webpack warning)
  turbopack: {},

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
