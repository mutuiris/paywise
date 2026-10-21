'use client';

import { useState, useMemo } from 'react';
import { AdminUser } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { INITIAL_ADMIN_USERS } from '@/data/mock-admin-users';

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [search, setSearch] = useState('');

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

  const updateRole = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  const addUser = (newUser: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const created: AdminUser = {
      ...newUser,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [created, ...prev]);
  };

  return { users, filteredUsers, search, setSearch, updateRole, toggleActive, addUser };
}
