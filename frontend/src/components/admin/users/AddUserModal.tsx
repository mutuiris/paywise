'use client';

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { AdminUser } from '@/types/admin';
import { AddUserForm, AddUserFormData } from './AddUserForm';

export interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (user: Omit<AdminUser, 'id' | 'createdAt'>) => void;
}

export function AddUserModal({ open, onClose, onAdd }: AddUserModalProps) {
  const [data, setData] = useState<AddUserFormData>({ name: '', email: '', department: '', role: 'EMPLOYEE' });
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.email.trim()) return;
    onAdd({ ...data, isActive: true });
    setData({ name: '', email: '', department: '', role: 'EMPLOYEE' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl animate-fade-up">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand"><UserPlus className="size-4" /></span>
            <h3 className="text-base font-bold text-ink">Add New User</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted-ink hover:text-ink cursor-pointer"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <AddUserForm data={data} onChange={setData} />
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas cursor-pointer">Cancel</button>
            <button type="submit" className="rounded-md bg-brand px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep cursor-pointer">Create User</button>
          </div>
        </form>
      </div>
    </div>
  );
}
