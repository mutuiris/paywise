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

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base origin of the Paywise Django backend, for example `http://127.0.0.1:8000`. No trailing slash. |
| `NEXT_PUBLIC_DEMO_MODE` | When `true`, read views render clearly-labelled fixture data and write actions stay disabled. |

If `NEXT_PUBLIC_API_URL` is not set, employee pages show an "API not configured" state instead of
falling back to mock data.

### Authentication, sessions and CORS

The frontend calls the backend with `fetch(..., { credentials: 'include' })` and expects Django
session (cookie) authentication. The API currently exposes no login or identity endpoint
(`/api/accounts/` has no routes yet), and most views are `csrf_exempt`. Until the backend adds
CORS support, the browser blocks cross-origin requests from this origin, so the frontend origin
(`http://localhost:3000`) must be allowed by the backend or both apps must be served through the
same origin via a reverse proxy. Do not disable CSRF in application code.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
