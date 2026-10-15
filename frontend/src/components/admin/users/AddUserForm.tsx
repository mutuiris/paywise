import React from 'react';
import { UserRole, ROLE_LABELS } from '@/types/auth';

export interface AddUserFormData {
  name: string; email: string; department: string; role: UserRole;
}

export function AddUserForm({ data, onChange }: { data: AddUserFormData; onChange: (d: AddUserFormData) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-ink">Full Name</label>
        <input type="text" required value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} placeholder="e.g. Samuel Gitau" className="mt-1 w-full rounded-md border border-line px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink">Email Address</label>
        <input type="email" required value={data.email} onChange={(e) => onChange({ ...data, email: e.target.value })} placeholder="samuel.gitau@imaraworks.co.ke" className="mt-1 w-full rounded-md border border-line px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-ink">Department</label>
          <input type="text" required value={data.department} onChange={(e) => onChange({ ...data, department: e.target.value })} placeholder="e.g. Operations" className="mt-1 w-full rounded-md border border-line px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink">Role</label>
          <select value={data.role} onChange={(e) => onChange({ ...data, role: e.target.value as UserRole })} className="mt-1 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-ink focus:border-brand">
            {Object.entries(ROLE_LABELS).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
