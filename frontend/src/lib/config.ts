export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const API_CONFIGURED = API_URL.length > 0;

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
