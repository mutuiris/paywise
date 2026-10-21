import type { NextConfig } from "next";

/**
 * Backend origin used by the same-origin /api proxy.
 *
 * Keeping the browser on the same origin means the Django session cookie and
 * the CSRF cookie are sent without the backend needing CORS support.
 */
const backendUrl = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.PAYWISE_API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Django serves its API on trailing-slash paths and cannot redirect a POST
  // to add the slash, so the slash has to survive the rewrite untouched.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        // The catch-all pattern keeps the trailing slash that Django requires.
        source: "/api/:path(.*)",
        destination: `${backendUrl}/api/:path`,
      },
    ];
  },
};

export default nextConfig;
