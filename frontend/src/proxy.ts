import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRoleDefaultPath(role?: string | null): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'FINANCE':
      return '/finance/dashboard';
    case 'EMPLOYEE':
      return '/employee';
    case 'MANAGER':
      return '/manager/dashboard';
    default:
      return '/login';
  }
}

function normalizeRole(role?: string | null): string | null {
  if (!role) return null;
  const upper = role.toUpperCase().trim();
  if (upper === 'ADMINISTRATOR' || upper === 'ADMIN') return 'ADMIN';
  if (upper === 'FINANCE_OFFICER' || upper === 'FINANCE') return 'FINANCE';
  if (upper === 'MANAGER') return 'MANAGER';
  if (upper === 'EMPLOYEE') return 'EMPLOYEE';
  return null;
}

interface VerifiedUser {
  id: string;
  role: string;
  username?: string;
  email?: string;
}

/**
 * Validates the user's session with the backend /api/accounts/me/ endpoint.
 * Forwards the request Cookie header so Django's session cookie (sessionid) is checked.
 * Does NOT trust client-writable cookies like `paywise_role`.
 */
async function getVerifiedBackendUser(request: NextRequest): Promise<VerifiedUser | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  if (!cookieHeader) return null;

  // Quick check: if there is no session-related cookie present at all, avoid network call
  const hasSessionCookie =
    request.cookies.has('sessionid') ||
    request.cookies.has('paywise_session');
  if (!hasSessionCookie) {
    return null;
  }

  const backendOrigin = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.PAYWISE_API_ORIGIN ||
    'http://127.0.0.1:8000'
  ).replace(/\/+$/, '');

  try {
    const res = await fetch(`${backendOrigin}/api/accounts/me/`, {
      method: 'GET',
      headers: {
        cookie: cookieHeader,
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const user = data.user || data;
    if (user && user.role) {
      return {
        id: String(user.id),
        role: String(user.role),
        username: user.username,
        email: user.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verify identity directly with backend /api/accounts/me/
  const verifiedUser = await getVerifiedBackendUser(request);
  const verifiedRole = normalizeRole(verifiedUser?.role);

  // 1. If user is authenticated and visits /login, redirect to their role dashboard
  if (pathname === '/login') {
    if (verifiedUser && verifiedRole) {
      return NextResponse.redirect(new URL(getRoleDefaultPath(verifiedRole), request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected portal routes
  const isProtected = ['/admin', '/manager', '/finance', '/employee'].some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    // If not authenticated with backend session, redirect to login
    if (!verifiedUser || !verifiedRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control (RBAC) verified by backend:
    if (pathname.startsWith('/admin') && verifiedRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(verifiedRole), request.url));
    }

    if (pathname.startsWith('/finance') && verifiedRole !== 'FINANCE' && verifiedRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(verifiedRole), request.url));
    }

    if (pathname.startsWith('/manager') && verifiedRole !== 'MANAGER' && verifiedRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(verifiedRole), request.url));
    }

    if (pathname.startsWith('/employee') && !verifiedRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/finance/:path*',
    '/employee/:path*',
    '/login',
  ],
};
