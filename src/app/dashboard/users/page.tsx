'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { UserTable } from '@/components/dashboard/user/user-table';

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Stack spacing={1}>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your users and their roles
          </Typography>
        </Stack>
        <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
          Add User
        </Button>
      </Stack>
      <UserTable />
    </Stack>
  );
}
