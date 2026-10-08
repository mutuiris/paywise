import React from 'react';

interface ForgotNoticeProps {
  show: boolean;
}

export function ForgotNotice({ show }: ForgotNoticeProps) {
  if (!show) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-line bg-surface p-3.5 text-sm text-muted-ink animate-in fade-in duration-200"
    >
      Password resets are managed by system administrators. Please contact your internal administrator.
    </div>
  );
}
