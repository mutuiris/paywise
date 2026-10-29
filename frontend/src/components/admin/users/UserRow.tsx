import React from 'react';
import { AdminUser } from '@/types/admin';
import { UserRole, ROLE_LABELS } from '@/types/auth';
import { UserStatusBadge } from './UserStatusBadge';
import { getClientUser } from '@/lib/auth/session';

export interface UserRowProps {
  user: AdminUser;
  onRoleChange: (id: string, role: UserRole) => void;
  onRequestToggleStatus: (user: AdminUser) => void;
}

export function UserRow({ user, onRoleChange, onRequestToggleStatus }: UserRowProps) {
  const isSelf = user.id === getClientUser()?.id;
  const dateStr = new Date(user.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
  const initials = user.name.split(' ').map((n) => n[0]).join('');

  return (
    <tr className="hover:bg-canvas/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand-deep">{initials}</span>
          <div><p className="font-semibold text-ink text-sm leading-tight">{user.name}</p><p className="text-[11px] text-muted-ink">{user.department}</p></div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-ink">{user.email}</td>
      <td className="px-4 py-3">
        <select value={user.role} disabled={isSelf} onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)} className="rounded border border-line bg-surface px-2 py-1 text-xs text-ink focus:border-brand disabled:opacity-60 cursor-pointer">
          {Object.entries(ROLE_LABELS).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
        </select>
      </td>
      <td className="px-4 py-3"><UserStatusBadge isActive={user.isActive} /></td>
      <td className="px-4 py-3 text-xs text-muted-ink font-mono">{dateStr}</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isSelf}
          onClick={() => onRequestToggleStatus(user)}
          title={isSelf ? 'You cannot deactivate your own account' : undefined}
          className={`text-xs font-semibold px-2 py-1 rounded transition cursor-pointer ${isSelf ? 'opacity-30 cursor-not-allowed' : user.isActive ? 'text-err hover:bg-err-light' : 'text-ok hover:bg-ok-light'}`}
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  );
}
