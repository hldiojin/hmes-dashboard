'use client';

import * as React from 'react';
import { authService } from '@/services/authService';

import type { AuthResponse } from '@/types/auth';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: AuthResponse | null;
  isLoading: boolean;
  error: string | null;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

// Add this hook to use the UserContext
export function useUser(): UserContextValue {
  const context = React.useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

export function UserProvider2({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = React.useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      logger.debug('[UserProvider]: Checking user session');

      // Get current user from auth service
      const currentUser = authService.getCurrentUser();

      if (currentUser) {
        logger.debug('[UserProvider]: User session found', { userId: currentUser.id });
        setUser(currentUser);
        setError(null);
      } else {
        logger.debug('[UserProvider]: No user session found');
        setUser(null);
      }
    } catch (err) {
      logger.error('[UserProvider]: Failed to check session', err);
      setError('Failed to retrieve user session');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check session on initial load
  React.useEffect(() => {
    checkSession().catch(() => {
      // error already handled in checkSession
    });
  }, [checkSession]);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      error,
      checkSession,
    }),
    [user, isLoading, error, checkSession]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
