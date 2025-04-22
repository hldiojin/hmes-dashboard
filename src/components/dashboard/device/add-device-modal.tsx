'use client';

import * as React from 'react';
import { CreateDeviceRequest } from '@/types/device';
import { deviceService } from '@/services/deviceService';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CalendarBlank, X } from '@phosphor-icons/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDeviceModal({ open, onClose, onSuccess }: AddDeviceModalProps): React.JSX.Element {
  const [name, setName] = React.useState<string>('');
  const [serialNumber, setSerialNumber] = React.useState<string>('');
  const [model, setModel] = React.useState<string>('');
  const [manufacturer, setManufacturer] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('Active');
  const [location, setLocation] = React.useState<string>('');
  const [purchaseDate, setPurchaseDate] = React.useState<Dayjs | null>(null);
  const [notes, setNotes] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    serialNumber?: string;
    model?: string;
    manufacturer?: string;
    status?: string;
    general?: string;
  }>({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName('');
    setSerialNumber('');
    setModel('');
    setManufacturer('');
    setStatus('Active');
    setLocation('');
    setPurchaseDate(null);
    setNotes('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      serialNumber?: string;
      model?: string;
      manufacturer?: string;
      status?: string;
      general?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Tên thiết bị là bắt buộc';
    }

    if (!serialNumber.trim()) {
      newErrors.serialNumber = 'Số serial là bắt buộc';
    }

    if (!model.trim()) {
      newErrors.model = 'Model là bắt buộc';
    }

    if (!manufacturer.trim()) {
      newErrors.manufacturer = 'Nhà sản xuất là bắt buộc';
    }

    if (!status) {
      newErrors.status = 'Trạng thái là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const deviceData: CreateDeviceRequest = {
        name,
        serialNumber,
        model,
        manufacturer,
        status: status as 'Active' | 'Inactive' | 'Maintenance',
        ...(location && { location }),
        ...(purchaseDate && { purchaseDate: purchaseDate.format('YYYY-MM-DD') }),
        ...(notes && { notes }),
      };

      console.log('Submitting device data:', deviceData);

      const response = await deviceService.createDevice(deviceData);
      console.log('Create device response:', response);

      // Đóng modal sau khi tạo thành công
      handleClose();

      // Gọi callback để refresh danh sách thiết bị
      onSuccess();
    } catch (error: any) {
      console.error('Error creating device:', error);

      // Extract error message if available
      let errorMessage = 'Đã xảy ra lỗi khi tạo thiết bị';
      if (error.response?.data?.response?.message) {
        errorMessage = error.response.data.response.message;
      }

      setErrors({
        ...errors,
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thêm thiết bị mới</Typography>
          <IconButton onClick={loading ? undefined : handleClose} size="small" disabled={loading}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {errors.general && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errors.general}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tên thiết bị"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số serial"
                fullWidth
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                error={!!errors.serialNumber}
                helperText={errors.serialNumber}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Model"
                fullWidth
                value={model}
                onChange={(e) => setModel(e.target.value)}
                error={!!errors.model}
                helperText={errors.model}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nhà sản xuất"
                fullWidth
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                error={!!errors.manufacturer}
                helperText={errors.manufacturer}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status} sx={{ mb: 2 }}>
                <InputLabel id="status-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Trạng thái"
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="Active">Hoạt động</MenuItem>
                  <MenuItem value="Inactive">Không hoạt động</MenuItem>
                  <MenuItem value="Maintenance">Bảo trì</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Vị trí"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
                placeholder="Phòng máy, khu vực, v.v..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Ngày mua"
                value={purchaseDate}
                onChange={(newValue) => setPurchaseDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: loading,
                    sx: { mb: 2 },
                  },
                }}
                slots={{
                  openPickerIcon: CalendarBlank,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi chú"
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang tạo...' : 'Tạo thiết bị'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 