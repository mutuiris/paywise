import React from 'react';

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ok">
      <span className="size-1.5 rounded-full bg-ok" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-ink">
      <span className="size-1.5 rounded-full bg-muted-ink" />
      Inactive
    </span>
  );
}
