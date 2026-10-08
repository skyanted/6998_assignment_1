import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/week4/cover/[id]": ["./assets/week4-covers/*.jpg"] },
};

export default nextConfig;
