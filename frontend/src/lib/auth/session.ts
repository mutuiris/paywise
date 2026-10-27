import { BackendUserRole, User, UserRole } from '@/lib/api/types';

export const SESSION_COOKIE_NAME = 'paywise_session';
export const ROLE_COOKIE_NAME = 'paywise_role';
export const USER_STORAGE_KEY = 'paywise_user';

/** The identity payload the backend returns from the accounts endpoints. */
export interface AccountIdentity {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

/** The backend uses FINANCE_OFFICER / ADMINISTRATOR, the UI uses FINANCE / ADMIN. */
const ROLE_MAP: Record<BackendUserRole, UserRole> = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  FINANCE_OFFICER: 'FINANCE',
  ADMINISTRATOR: 'ADMIN',
};

function isBackendRole(role: unknown): role is BackendUserRole {
  return (
    role === 'EMPLOYEE' ||
    role === 'MANAGER' ||
    role === 'FINANCE_OFFICER' ||
    role === 'ADMINISTRATOR'
  );
}

/**
 * Turns the identity the backend returns (snake_case, no display name) into
 * the shape the components expect, so a missing name or a backend role name
 * can never break a page.
 */
export function toClientUser(user: User | AccountIdentity): User {
  const candidate = user as Partial<User> & Partial<AccountIdentity>;

  const name =
    candidate.name?.trim() ||
    [candidate.first_name, candidate.last_name].filter(Boolean).join(' ').trim() ||
    candidate.username?.trim() ||
    candidate.email?.split('@')[0] ||
    'Paywise user';

  const role = isBackendRole(candidate.role)
    ? ROLE_MAP[candidate.role]
    : ((candidate.role as UserRole | undefined) ?? 'EMPLOYEE');

  return {
    id: candidate.id ?? '',
    name,
    email: candidate.email ?? '',
    role,
    isActive: candidate.isActive ?? candidate.is_active ?? true,
    department: candidate.department,
    approvalLimit: candidate.approvalLimit,
  };
}

/** Two-letter avatar initials, safe for a missing or single-word name. */
export function getInitials(name: string | undefined | null, fallback = 'PW'): string {
  if (!name) return fallback;
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return initials || fallback;
}

export function setClientSession(user: User | AccountIdentity): void {
  if (typeof document === 'undefined') return;

  const clientUser = toClientUser(user);

  // Max age: 7 days
  const maxAge = 60 * 60 * 24 * 7;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(clientUser.id)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `${ROLE_COOKIE_NAME}=${encodeURIComponent(clientUser.role)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(clientUser));
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
    return toClientUser(JSON.parse(raw) as User);
  } catch {
    return null;
  }
}

export function getRoleDashboardPath(role: UserRole | BackendUserRole | string): string {
  const clientRole = isBackendRole(role) ? ROLE_MAP[role] : (role as UserRole);

  switch (clientRole) {
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
