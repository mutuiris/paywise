import type { NextConfig } from 'next';

/**
 * Backend origin used by the same-origin development proxy.
 * Leave unset to call the backend directly from the browser instead
 * (that requires the backend to allow this origin via CORS).
 */
const apiOrigin = (process.env.PAYWISE_API_ORIGIN ?? '').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  // The backend serves its API on trailing-slash paths (Django APPEND_SLASH).
  // Without this, Next would strip the slash and fight Django with a redirect loop.
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_API_PROXY: apiOrigin ? '1' : '',
  },
  async rewrites() {
    if (!apiOrigin) return [];
    // The catch-all pattern keeps the trailing slash, which Django's API routes
    // require (APPEND_SLASH cannot redirect a POST, so the slash must survive).
    return [{ source: '/api/:path(.*)', destination: `${apiOrigin}/api/:path` }];
  },
};

export default nextConfig;
