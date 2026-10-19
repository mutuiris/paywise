'use client';

import React, { useState } from 'react';
import { AdminUser } from '@/types/admin';
import { FilterBar } from '../common/FilterBar';
import { ConfirmModal } from '../common/ConfirmModal';
import { useUsers } from './useUsers';
import { UsersHeader } from './UsersHeader';
import { UsersTable } from './UsersTable';
import { AddUserModal } from './AddUserModal';

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
