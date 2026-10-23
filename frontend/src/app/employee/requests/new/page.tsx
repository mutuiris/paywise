'use client';

import React from 'react';
import { NewRequestForm } from '@/components/manager/requests';

export default function NewPaymentRequestPage() {
  return (
    <NewRequestForm
      basePath="/employee"
      backHref="/employee/requests"
      redirectHref="/employee/requests"
      title="New Payment Request"
      subtitle="Submit a vendor invoice or payment request for project authorization."
    />
  );
}
