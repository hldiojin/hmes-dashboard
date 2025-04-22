'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { UserTable } from '@/components/dashboard/user/user-table';
import { AddUserModal } from '@/components/dashboard/user/add-user-modal';
import usePageTitle from '@/lib/hooks/usePageTitle';

export default function Page(): React.JSX.Element {
  // Đặt tiêu đề trang là Hmes-dashboard
  usePageTitle('Người dùng');
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleUserAdded = () => {
    // Trigger a refresh of the user table
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Stack spacing={1}>
          <Typography variant="h4">Người dùng</Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý người dùng và vai trò của họ
          </Typography>
        </Stack>
        <Button 
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} 
          variant="contained"
          onClick={handleOpenAddUserModal}
        >
          Thêm người dùng
        </Button>
      </Stack>
      <UserTable refreshTrigger={refreshTrigger} />
      <AddUserModal 
        open={isAddUserModalOpen} 
        onClose={handleCloseAddUserModal} 
        onSuccess={handleUserAdded} 
      />
    </Stack>
  );
}
