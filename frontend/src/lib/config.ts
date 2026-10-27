export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/**
 * True when the Next.js server proxies /api/* to the Paywise backend
 * (see `PAYWISE_API_ORIGIN` in next.config.ts). Proxy mode keeps requests
 * same-origin, so the browser does not need cross-origin permissions.
 */
export const API_PROXY_ENABLED = process.env.NEXT_PUBLIC_API_PROXY === '1';

export const API_CONFIGURED = API_URL.length > 0 || API_PROXY_ENABLED;

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/** Shows one-click demo logins (shared password) on the sign-in page. Keep off in production. */
export const SHOW_DEMO_ACCOUNTS = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true';
