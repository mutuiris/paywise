import { apiFetch } from '@/lib/api-client';
import type { User } from '@/types/domain';

export function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/api/accounts/me/');
}
