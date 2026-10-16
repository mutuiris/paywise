import React from 'react';
import { UserProfile, UserRole } from '@/types/auth';

export interface AppShellProps {
  role: UserRole;
  basePath: string;
  user: UserProfile;
  badges?: {
    approvals?: number;
    payments?: number;
    reconciliation?: number;
  };
  children: React.ReactNode;
}
