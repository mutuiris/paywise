import type { NextConfig } from 'next';

/**
 * Backend origin used by the same-origin development proxy.
 * Leave unset to call the backend directly from the browser instead
 * (that requires the backend to allow this origin via CORS).
 */
const apiOrigin = (process.env.PAYWISE_API_ORIGIN ?? '').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_PROXY: apiOrigin ? '1' : '',
  },
  async rewrites() {
    if (!apiOrigin) return [];
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
