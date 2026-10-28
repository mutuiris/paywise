import React from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';

export interface UsersHeaderProps {
  onAddUserClick: () => void;
}

export function UsersHeader({ onAddUserClick }: UsersHeaderProps) {
  return (
    <PageHeader
      title="Users"
      description="Deactivated users cannot take further actions. Their past approvals remain in the record."
      actions={
        <button
          type="button"
          onClick={onAddUserClick}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-deep cursor-pointer"
        >
          <UserPlus className="size-3.5" />
          <span>Add User</span>
        </button>
      }
    />
  );
}
