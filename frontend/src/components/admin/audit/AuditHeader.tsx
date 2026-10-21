import React from 'react';
import { PageHeader } from '../common/PageHeader';

export function AuditHeader() {
  return (
    <PageHeader
      title="Audit Log"
      description="Read-only. Audit events cannot be edited or deleted."
      crumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Audit Log' }]}
    />
  );
}
