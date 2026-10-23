This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment

Copy `.env.example` to `.env.local` and point it at the Paywise backend:

```bash
cp .env.example .env.local
```

| Variable | Where it runs | Purpose |
| --- | --- | --- |
| `PAYWISE_API_ORIGIN` | server only | Backend origin that the Next.js server proxies `/api/*` to. Recommended for local development. |
| `NEXT_PUBLIC_API_URL` | browser | Backend origin called directly by the browser. Only use this when the backend allows this origin via CORS. |
| `NEXT_PUBLIC_DEMO_MODE` | browser | When `true`, read views render clearly-labelled fixture data and write actions stay disabled. |

If neither `PAYWISE_API_ORIGIN` nor `NEXT_PUBLIC_API_URL` is set, employee pages show an
"API not configured" state instead of falling back to mock data.

### Why the proxy is the default

The Paywise backend has no CORS middleware, so a browser on `http://localhost:3000` cannot call
it on `http://127.0.0.1:8000` directly. Proxying `/api/*` through Next.js keeps every request
same-origin, which means the Django session cookie and the CSRF cookie work without weakening
security on the backend. In production, serve the app and the API behind the same origin.

### Authentication, sessions and CSRF

Authentication is Django session based. The frontend signs in with `POST /api/accounts/login/`
(`{ "username", "password" }`), reads the current user with `GET /api/accounts/me/` and signs out
with `POST /api/accounts/logout/`. Because Django protects unsafe methods, the client first calls
`GET /api/accounts/csrf/` to obtain the CSRF cookie and then sends it in the `X-CSRFToken` header.
The password is never stored in the browser beyond the form field, and no token is kept in
`localStorage`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
