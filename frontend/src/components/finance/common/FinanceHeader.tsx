'use client';

import React from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { DEMO_USERS } from '@/types/auth';

export interface FinanceHeaderProps {
  onMenuClick?: () => void;
}

export function FinanceHeader({ onMenuClick }: FinanceHeaderProps) {
  return (
    <AppHeader
      user={DEMO_USERS.faith}
      onMenuClick={onMenuClick}
    />
  );
}
