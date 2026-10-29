'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { AdminUser } from '@/types/admin';
import { UserRole } from '@/types/auth';
import type { BackendUserRole } from '@/lib/api/types';
import { userService, type UserDTO } from '@/lib/api/services';
import { DEMO_MODE } from '@/lib/config';
import { INITIAL_ADMIN_USERS } from '@/data/mock-admin-users';

const TO_BACKEND: Record<UserRole, BackendUserRole> = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  FINANCE: 'FINANCE_OFFICER',
  ADMIN: 'ADMINISTRATOR',
};

const TO_CLIENT: Record<BackendUserRole, UserRole> = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  FINANCE_OFFICER: 'FINANCE',
  ADMINISTRATOR: 'ADMIN',
};

function toAdminUser(u: UserDTO): AdminUser {
  return {
    id: u.id,
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username,
    email: u.email,
    role: TO_CLIENT[u.role] ?? 'EMPLOYEE',
    department: u.department,
    isActive: u.is_active,
    createdAt: u.date_joined,
  };
}

const message = (err: unknown) => (err instanceof Error ? err.message : 'Unable to reach the Paywise API.');

export type NewUser = Omit<AdminUser, 'id' | 'createdAt' | 'isActive'> & { password: string };

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (DEMO_MODE) {
        setUsers(INITIAL_ADMIN_USERS);
        return;
      }
      const res = await userService.list();
      setUsers(res.results.map(toAdminUser));
    } catch (err) {
      setError(message(err));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }, [users, search]);

  const replace = (updated: UserDTO) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? toAdminUser(updated) : u)));

  const updateRole = async (id: string, role: UserRole) => {
    setError(null);
    try {
      replace((await userService.update(id, { role: TO_BACKEND[role] })).user);
    } catch (err) {
      setError(message(err));
    }
  };

  const toggleActive = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setError(null);
    try {
      replace((await userService.update(id, { is_active: !user.isActive })).user);
    } catch (err) {
      setError(message(err));
    }
  };

  /** Resolves to an error message, or null once the backend saved the user. */
  const addUser = async (newUser: NewUser): Promise<string | null> => {
    const [first, ...rest] = newUser.name.trim().split(/\s+/);
    try {
      const { user } = await userService.create({
        email: newUser.email.trim(),
        password: newUser.password,
        role: TO_BACKEND[newUser.role],
        first_name: first,
        last_name: rest.join(' '),
        department: newUser.department.trim(),
      });
      setUsers((prev) => [toAdminUser(user), ...prev]);
      return null;
    } catch (err) {
      return message(err);
    }
  };

  return { users, filteredUsers, search, setSearch, error, updateRole, toggleActive, addUser };
}
