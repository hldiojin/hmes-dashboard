'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    if (!user) {
      logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');
      router.replace(paths.auth.signIn);
      return;
    }

    // Check if user is a Customer, don't allow them access
    if (user.role === 'Customer') {
      logger.debug('[AuthGuard]: User is a Customer, redirecting to sign in');
      // Clear any auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace(paths.auth.signIn);
      return;
    }

    // Redirect technicians and consultants away from the overview page
    if ((user.role === 'Technician' || user.role === 'Consultant') && pathname === paths.dashboard.overview) {
      logger.debug('[AuthGuard]: Technician/Consultant trying to access overview page, redirecting to tickets');
      router.replace(paths.dashboard.tickets);
      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [user, error, isLoading, pathname]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
