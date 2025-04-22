'use client';

import * as React from 'react';
import { CreateUserRequest, userService } from '@/services/userService';
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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { X } from '@phosphor-icons/react';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps): React.JSX.Element {
  const [name, setName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [role, setRole] = React.useState<string>('Customer');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
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
    setEmail('');
    setPhone('');
    setRole('Customer');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      general?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
    }

    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!role) {
      newErrors.role = 'Vai trò là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData: CreateUserRequest = {
        name,
        email,
        phone,
        role,
      };

      console.log('Submitting user data:', userData);

      const response = await userService.createUser(userData);
      console.log('Create user response:', response);

      // Đóng modal sau khi tạo thành công
      handleClose();

      // Gọi callback để refresh danh sách người dùng
      onSuccess();
    } catch (error: any) {
      console.error('Error creating user:', error);

      // Extract error message if available
      let errorMessage = 'Đã xảy ra lỗi khi tạo người dùng';
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
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thêm người dùng mới</Typography>
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
          <TextField
            label="Họ tên"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 3 }}
            disabled={loading}
            type="email"
          />

          <TextField
            label="Số điện thoại"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <FormControl fullWidth error={!!errors.role} sx={{ mb: 3 }}>
            <InputLabel id="role-label">Vai trò</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Vai trò"
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="Consultant">Consultant</MenuItem>
              <MenuItem value="Technician">Technician</MenuItem>
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>
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
          {loading ? 'Đang tạo...' : 'Tạo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}