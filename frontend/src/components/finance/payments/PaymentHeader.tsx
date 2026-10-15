import React from 'react';

export function PaymentHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Payment Processing
      </h1>
      <p className="mt-1 text-sm text-muted-ink">
        Initiate disbursements through simulated mock gateways (M-Pesa B2C / Bank RTGS).
      </p>
    </div>
  );
}
