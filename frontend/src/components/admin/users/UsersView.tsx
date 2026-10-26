'use client';

import React, { useState } from 'react';
import { AdminUser } from '@/types/admin';
import { FilterBar } from '../common/FilterBar';
import { ConfirmModal } from '../common/ConfirmModal';
import { useUsers } from './useUsers';
import { UsersHeader } from './UsersHeader';
import { UsersTable } from './UsersTable';
import { AddUserModal } from './AddUserModal';

import { ShieldAlert } from 'lucide-react';

export function UsersView() {
  const { filteredUsers, search, setSearch, updateRole, toggleActive, addUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const isAct = selectedUser?.isActive;
  const confirmTitle = isAct ? `Deactivate ${selectedUser.name}?` : `Activate ${selectedUser?.name}?`;
  const confirmDesc = isAct
    ? 'They will not be able to sign in or take new actions. Historical approvals and audit records stay unchanged.'
    : 'They will regain access with their current role.';

  return (
    <div className="space-y-4 font-serif">
      <UsersHeader onAddUserClick={() => setShowAddModal(true)} />

      {/* Backend Integration Status Notice mandated by Handoff Specification Section 4.4 */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-2xs">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-900">Backend User Management Notice</p>
          <p className="text-amber-800">
            The Django backend does not currently expose user management mutation endpoints (<code>POST /api/accounts/users/</code> or status toggle routes). Directory operations below are displayed in demonstration read-only mode to prevent fake server persistence.
          </p>
        </div>
      </div>
      <FilterBar
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Name, email, role…"
        meta={`${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'}`}
        onClear={search ? () => setSearch('') : undefined}
      />
      <UsersTable users={filteredUsers} onRoleChange={updateRole} onRequestToggleStatus={(u) => setSelectedUser(u)} />
      <ConfirmModal
        open={!!selectedUser} title={confirmTitle} description={confirmDesc}
        confirmLabel={isAct ? 'Deactivate' : 'Activate'} tone={isAct ? 'danger' : 'brand'}
        onConfirm={() => { if (selectedUser) toggleActive(selectedUser.id); setSelectedUser(null); }}
        onCancel={() => setSelectedUser(null)}
      />
      <AddUserModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addUser} />
    </div>
  );
}
