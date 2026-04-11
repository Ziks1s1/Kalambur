import type { NextConfig } from "next";

const traceExcludes = [
  "./public/task-bank/**",
  "./tests/**",
  "./scripts/**",
  "./deploy/**",
  "./prisma/seed.*",
  "./node_modules/prisma/**",
  "./node_modules/@prisma/engines/**",
  "./node_modules/aws-crt/**",
  "./node_modules/@aws-sdk/signature-v4-crt/**",
  "./node_modules/.pnpm/**/node_modules/prisma/**",
  "./node_modules/.pnpm/**/node_modules/@prisma/engines/**",
  "./node_modules/.pnpm/**/node_modules/aws-crt/**",
  "./node_modules/.pnpm/**/node_modules/@aws-sdk/signature-v4-crt/**",
  "./node_modules/@swc/core-darwin-*/**",
  "./node_modules/@swc/core-win32-*/**",
  "./node_modules/@swc/core-linux-musl*/**",
  "./node_modules/@next/swc-darwin-*/**",
  "./node_modules/@next/swc-win32-*/**",
  "./node_modules/@img/sharp-darwin-*/**",
  "./node_modules/@img/sharp-win32-*/**"
];

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": traceExcludes
  },
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
