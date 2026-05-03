import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.yahoo.com" },
      { protocol: "https", hostname: "**.yimg.com" },
      { protocol: "https", hostname: "s.yimg.com" },
      { protocol: "https", hostname: "media.zenfs.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
