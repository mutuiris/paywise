import React from 'react';

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RememberMeCheckbox({
  checked,
  onChange,
}: RememberMeCheckboxProps) {
  return (
    <div className="pt-0.5">
      <label className="flex items-center gap-2.5 text-sm text-ink select-none cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 rounded border-line text-brand focus:ring-brand accent-brand cursor-pointer"
        />
        <span>Remember me on this device</span>
      </label>
    </div>
  );
}
