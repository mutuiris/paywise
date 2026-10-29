'use client';

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { NewUser } from './useUsers';
import { AddUserForm, AddUserFormData } from './AddUserForm';

export interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (user: NewUser) => Promise<string | null>;
}

const EMPTY_FORM: AddUserFormData = { name: '', email: '', password: '', department: '', role: 'EMPLOYEE' };

export function AddUserModal({ open, onClose, onAdd }: AddUserModalProps) {
  const [data, setData] = useState<AddUserFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.email.trim()) return;
    setSaving(true);
    const failure = await onAdd(data);
    setSaving(false);
    if (failure) {
      setError(failure);
      return;
    }
    setData(EMPTY_FORM);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 font-serif">
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
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-md bg-brand disabled:opacity-60 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep cursor-pointer">Create User</button>
          </div>
        </form>
      </div>
    </div>
  );
}
