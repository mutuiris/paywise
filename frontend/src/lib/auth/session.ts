import { User, UserRole } from '@/lib/api/types';

export const SESSION_COOKIE_NAME = 'paywise_session';
export const ROLE_COOKIE_NAME = 'paywise_role';
export const USER_STORAGE_KEY = 'paywise_user';

export function setClientSession(user: User): void {
  if (typeof document === 'undefined') return;

  // Max age: 7 days
  const maxAge = 60 * 60 * 24 * 7;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(user.id)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `${ROLE_COOKIE_NAME}=${encodeURIComponent(user.role)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // LocalStorage unavailable
  }
}

export function clearClientSession(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // LocalStorage unavailable
  }
}

export function getClientUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'FINANCE':
      return '/finance/dashboard';
    case 'EMPLOYEE':
      return '/employee';
    case 'MANAGER':
    default:
      return '/manager/dashboard';
  }
}
