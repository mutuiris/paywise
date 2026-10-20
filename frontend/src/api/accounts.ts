import { apiFetch } from '@/lib/api-client';
import type { User } from '@/types/domain';

interface UserEnvelope {
  user: User;
}

/** The backend wraps identity payloads in `{ "user": ... }`. */
function unwrapUser(data: UserEnvelope | User): User {
  if (data && typeof data === 'object' && 'user' in data && data.user) {
    return data.user;
  }
  return data as User;
}

export async function getCurrentUser(): Promise<User> {
  const data = await apiFetch<UserEnvelope | User>('/api/accounts/me/');
  return unwrapUser(data);
}

export async function signIn(username: string, password: string, remember = true): Promise<User> {
  const data = await apiFetch<UserEnvelope | User>('/api/accounts/login/', {
    method: 'POST',
    body: { username, password, remember },
  });
  return unwrapUser(data);
}

export async function signOut(): Promise<void> {
  await apiFetch<{ detail?: string }>('/api/accounts/logout/', { method: 'POST' });
}

export async function fetchCsrfToken(): Promise<string> {
  const data = await apiFetch<{ csrfToken: string }>('/api/accounts/csrf/');
  return data.csrfToken;
}
