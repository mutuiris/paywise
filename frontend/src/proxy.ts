import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRoleDefaultPath(role?: string): string {
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('paywise_session')?.value;
  const roleCookie = request.cookies.get('paywise_role')?.value;

  // 1. If user is logged in and visits /login, redirect to their dashboard
  if (pathname === '/login') {
    if (sessionCookie && roleCookie) {
      return NextResponse.redirect(new URL(getRoleDefaultPath(roleCookie), request.url));
    }
    return NextResponse.next();
  }

  // 2. Route protection for portals
  const isProtected = ['/admin', '/manager', '/finance', '/employee'].some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    // If no active session, redirect to login with return path
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control (RBAC):
    if (pathname.startsWith('/admin') && roleCookie !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(roleCookie), request.url));
    }

    if (pathname.startsWith('/finance') && roleCookie !== 'FINANCE' && roleCookie !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(roleCookie), request.url));
    }

    if (pathname.startsWith('/manager') && roleCookie !== 'MANAGER' && roleCookie !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(roleCookie), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/finance/:path*',
    '/employee/:path*',
    '/login',
  ],
};
