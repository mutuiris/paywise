'use client';

import React from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { DEMO_USERS } from '@/types/auth';

export interface ManagerHeaderProps {
  onMenuClick?: () => void;
}

export function ManagerHeader({ onMenuClick }: ManagerHeaderProps) {
  return (
    <AppHeader
      user={DEMO_USERS.carol}
      onMenuClick={onMenuClick}
    />
  );
}
