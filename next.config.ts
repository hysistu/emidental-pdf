import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    // Allow retracted + smile photo uploads with the order PDF
    proxyClientMaxBodySize: "12mb",
  },
};

export default nextConfig;
