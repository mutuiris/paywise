import React from 'react';
import { AdminUser } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { UserRow } from './UserRow';

export interface UsersTableProps {
  users: AdminUser[];
  onRoleChange: (id: string, role: UserRole) => void;
  onRequestToggleStatus: (user: AdminUser) => void;
}

export function UsersTable({ users, onRoleChange, onRequestToggleStatus }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted-ink font-serif">
        No users match your search criteria.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-2xs font-serif">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Users Directory</caption>
          <thead className="border-b border-line bg-canvas text-[12px] font-semibold text-muted-ink">
            <tr>
              <th className="px-4 py-2.5">User</th><th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th><th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Created</th><th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onRoleChange={onRoleChange} onRequestToggleStatus={onRequestToggleStatus} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
