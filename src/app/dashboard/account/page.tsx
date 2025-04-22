'use client';

import * as React from 'react';
import { authService } from '@/services/authService';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';

export default function Page(): React.JSX.Element {
  const [user, setUser] = React.useState<ReturnType<typeof authService.getCurrentUser>>(null);

  React.useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{user ? `${user.name}'s Account` : 'Account'}</Typography>
        {user && (
          <Typography variant="subtitle1" color="text.secondary">
            Kiểm soát tài khoản và thông tin cá nhân
          </Typography>
        )}
      </div>
      <Grid container spacing={3}>
        <Grid lg={4} md={6} xs={12}>
          <AccountInfo />
        </Grid>
        <Grid lg={8} md={6} xs={12}>
          <AccountDetailsForm />
        </Grid>
      </Grid>
    </Stack>
  );
}
