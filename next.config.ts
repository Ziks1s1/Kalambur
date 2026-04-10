import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["openai", "@prisma/adapter-pg", "@aws-sdk/client-s3"],
  outputFileTracingExcludes: {
    "*": ["./node_modules/aws-crt/**", "./node_modules/@aws-sdk/signature-v4-crt/**"]
  },
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
