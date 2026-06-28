import type { NextConfig } from "next";

// Biztonsági fejlécek (a .htaccess szerepét tölti be Next.js/Node környezetben).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
];

const nextConfig: NextConfig = {
  // Önálló (standalone) kimenet a kis méretű, Docker-barát production image-hez.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Jobb tree-shaking az ikonkönyvtárhoz (kisebb kliens bundle).
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
