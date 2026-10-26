'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AttemptItem } from './types';

export function AttemptStatusBadge({ status }: { status: AttemptItem['status'] }) {
  if (status === 'SUCCEEDED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 text-[11px] font-medium text-ok">
        <CheckCircle2 className="size-3" /><span>Succeeded</span>
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-err/30 bg-err/10 px-2 py-0.5 text-[11px] font-medium text-err">
        <XCircle className="size-3" /><span>Failed</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
      <AlertCircle className="size-3" /><span>{status}</span>
    </span>
  );
}
