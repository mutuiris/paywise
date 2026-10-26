import type { NextConfig } from 'next';

/**
 * Backend origin used by the same-origin development proxy.
 */
const backendUrl =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.PAYWISE_API_ORIGIN ||
  'http://127.0.0.1:8000';

const apiOrigin = backendUrl.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  // The backend serves its API on trailing-slash paths (Django APPEND_SLASH).
  // Without this, Next would strip the slash and fight Django with a redirect loop.
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_API_PROXY: apiOrigin ? '1' : '',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path(.*)',
        destination: `${apiOrigin}/api/:path`,
      },
    ];
  },
};

export default nextConfig;
