import React from 'react';

interface DemoAccountPickerProps {
  onSelect: (email: string) => void;
}

const DEMO_ROLES = [
  { label: 'Administrator', name: 'Grace Kamau', email: 'grace.kamau@imaraworks.co.ke', tone: 'border-purple-200 bg-purple-50/70 text-purple-900 hover:border-purple-400' },
  { label: 'Finance Officer', name: 'Faith Njeri', email: 'faith.njeri@imaraworks.co.ke', tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:border-emerald-400' },
  { label: 'Project Manager', name: 'Carol Wanjiku', email: 'carol.wanjiku@imaraworks.co.ke', tone: 'border-blue-200 bg-blue-50/70 text-blue-900 hover:border-blue-400' },
  { label: 'Site Employee', name: 'Alice Mwangi', email: 'alice.mwangi@imaraworks.co.ke', tone: 'border-amber-200 bg-amber-50/70 text-amber-900 hover:border-amber-400' },
];

export function DemoAccountPicker({ onSelect }: DemoAccountPickerProps) {
  return (
    <div className="mt-6 pt-5 border-t border-line font-serif">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-ink">Quick Demo Sign-In</span>
        <span className="text-[10px] text-muted-ink bg-canvas px-1.5 py-0.5 rounded border border-line">Click to fill</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DEMO_ROLES.map((role) => (
          <button
            key={role.email}
            type="button"
            onClick={() => onSelect(role.email)}
            className={`rounded-lg border p-2 text-left transition hover:shadow-2xs cursor-pointer ${role.tone}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider">{role.label}</div>
            <div className="text-xs font-semibold truncate text-ink">{role.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
