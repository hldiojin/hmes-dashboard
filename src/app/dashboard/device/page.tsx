'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { deviceService } from '@/services/deviceService';
import { Device } from '@/types/device';
// import { AddDeviceModal } from '@/components/dashboard/device/add-device-modal';
// import { DeviceTable } from '@/components/dashboard/device/device-table';
import dynamic from 'next/dynamic';

// Dynamically import DeviceTable and AddDeviceModal with ssr: false
const DeviceTable = dynamic(() => import('@/components/dashboard/device/device-table').then((mod) => mod.default), { ssr: false });
const AddDeviceModal = dynamic(() => import('@/components/dashboard/device/add-device-modal').then((mod) => mod.default), { ssr: false });



export default function Page(): React.JSX.Element {
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenAddDeviceModal = () => {
    setIsAddDeviceModalOpen(true);
  };

  const handleCloseAddDeviceModal = () => {
    setIsAddDeviceModalOpen(false);
  };

  const handleDeviceAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: 'Thiết bị đã được thêm thành công',
      severity: 'success'
    });
  };

  const handleViewDeviceDetails = (device: Device) => {
    console.log('View device details:', device);
  };

  const handleEditDevice = (device: Device) => {
    console.log('Edit device:', device);
  };

  const handleDeleteClick = (device: Device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedDevice(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDevice) return;

    setIsDeleting(true);
    try {
      await deviceService.deleteDevice(selectedDevice.id);
      setSnackbar({
        open: true,
        message: 'Thiết bị đã được xóa thành công',
        severity: 'success'
      });
      setRefreshTrigger((prev) => prev + 1);
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting device:', error);
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi xóa thiết bị',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Stack spacing={1}>
          <Typography variant="h4">Quản lý thiết bị</Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý danh sách thiết bị và theo dõi số lượng
          </Typography>
        </Stack>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleOpenAddDeviceModal}
        >
          Thêm thiết bị
        </Button>
      </Stack>

      {/* Dynamically loaded DeviceTable */}
      <DeviceTable
        refreshTrigger={refreshTrigger}
        onViewDetails={handleViewDeviceDetails}
        onEdit={handleEditDevice}
        onDelete={handleDeleteClick}
      />

      {/* Dynamically loaded AddDeviceModal */}
      <AddDeviceModal
        open={isAddDeviceModalOpen}
        onClose={handleCloseAddDeviceModal}
        onSuccess={handleDeviceAdded}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={!isDeleting ? handleCloseDeleteDialog : undefined}
      >
        <DialogTitle>Xác nhận xóa thiết bị</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thiết bị "{selectedDevice?.name}"?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

