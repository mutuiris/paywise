'use client';

import React, { createContext, useContext, useState, useSyncExternalStore } from 'react';
import { User } from '@/types/auth';
import { DEMO_USERS, DEMO_PASSWORD } from '@/data/demo-users';

interface AuthContextType {
  user: User | null;
  hydrated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'paywise_auth_user';

let authListeners: Array<() => void> = [];

function emitAuthChange() {
  for (const listener of authListeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter((l) => l !== callback);
  };
}

function getAuthSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const rawUser = useSyncExternalStore(subscribe, getAuthSnapshot, getServerSnapshot);
  const [isLoading, setIsLoading] = useState(false);

  const user: User | null = React.useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }, [rawUser]);

  const hydrated = typeof window !== 'undefined';

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);

    // Simulate realistic network delay
    await new Promise((resolve) => setTimeout(resolve, 450));

    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!foundUser || password !== DEMO_PASSWORD) {
      setIsLoading(false);
      throw new Error('Incorrect email or password. Please try again.');
    }

    if (!foundUser.isActive) {
      setIsLoading(false);
      throw new Error('This account is inactive. Contact an administrator.');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      emitAuthChange();
    } catch {
      // Ignore storage errors
    }

    setIsLoading(false);
    return foundUser;
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      emitAuthChange();
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hydrated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
