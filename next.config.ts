import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/ppt-generator-app" : "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
