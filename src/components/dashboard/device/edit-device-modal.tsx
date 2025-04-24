'use client';

import * as React from 'react';
import { Device, UpdateDeviceRequest } from '@/types/device';
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
  TextField,
  Typography,
} from '@mui/material';
import { X } from '@phosphor-icons/react';

interface EditDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  device: Device;
}

export function EditDeviceModal({ open, onClose, onSuccess, device }: EditDeviceModalProps): React.JSX.Element {
  const [name, setName] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const [price, setPrice] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    description?: string;
    attachment?: string;
    price?: string;
    quantity?: string;
    general?: string;
  }>({});

  // Initialize form with device data when modal opens
  React.useEffect(() => {
    if (open && device) {
      setName(device.name || '');
      setDescription(device.description || '');
      setPrice(device.price?.toString() || '');
      setQuantity(device.quantity?.toString() || '');
      setErrors({});
    }
  }, [open, device]);

  const handleClose = () => {
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      price?: string;
      quantity?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Tên thiết bị là bắt buộc';
    }

    if (!description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Giá phải là số dương';
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Số lượng phải là số nguyên dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const deviceData: UpdateDeviceRequest = {
        id: device.id,
        name,
        description,
        price: Number(price),
        quantity: Number(quantity),
      };

      if (attachment) {
        deviceData.attachment = attachment;
      }

      await deviceService.updateDevice(device.id, deviceData);
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating device:', error);
      let errorMessage = 'Đã xảy ra lỗi khi cập nhật thiết bị';
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachment(event.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chỉnh sửa thiết bị</Typography>
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
            <Grid item xs={12}>
              <TextField
                label="Tên thiết bị"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {attachment ? attachment.name : 'Cập nhật hình ảnh (tùy chọn)'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {errors.attachment && (
                <FormHelperText error>{errors.attachment}</FormHelperText>
              )}
              {device.attachment && !attachment && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Hình ảnh hiện tại:</Typography>
                  <Box
                    component="img"
                    src={device.attachment}
                    alt={device.name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Giá"
                fullWidth
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                disabled={loading}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số lượng"
                fullWidth
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={!!errors.quantity}
                helperText={errors.quantity}
                disabled={loading}
                InputProps={{
                  inputProps: { min: 1, step: 1 }
                }}
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
          {loading ? 'Đang cập nhật...' : 'Cập nhật thiết bị'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 