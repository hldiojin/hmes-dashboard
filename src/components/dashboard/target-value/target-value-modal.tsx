'use client';

import * as React from 'react';
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
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { X } from '@phosphor-icons/react';

import targetValueService from '@/services/targetValueService';
import { ValueType, ValueTypeEnums } from '@/types/targetValue';

interface TargetValueModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function TargetValueModal({ open, onClose, onSuccess }: TargetValueModalProps): React.JSX.Element {
  const [type, setType] = React.useState<ValueType>(ValueTypeEnums.SoluteConcentration);
  const [minValue, setMinValue] = React.useState<string>('');
  const [maxValue, setMaxValue] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{
    type?: string;
    minValue?: string;
    maxValue?: string;
    general?: string;
  }>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setType(ValueTypeEnums.SoluteConcentration);
    setMinValue('');
    setMaxValue('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getUnitForType = (type: string): string => {
    switch (type) {
      case 'SoluteConcentration':
        return 'ppm';
      case 'Temperature':
        return '°C';
      case 'WaterLevel':
        return 'cm';
      case 'Ph':
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      type?: string;
      minValue?: string;
      maxValue?: string;
      general?: string;
    } = {};

    if (!type) {
      newErrors.type = 'Loại là bắt buộc';
    }

    if (!minValue) {
      newErrors.minValue = 'Giá trị tối thiểu là bắt buộc';
    } else if (isNaN(Number(minValue))) {
      newErrors.minValue = 'Giá trị tối thiểu phải là số';
    }

    if (!maxValue) {
      newErrors.maxValue = 'Giá trị tối đa là bắt buộc';
    } else if (isNaN(Number(maxValue))) {
      newErrors.maxValue = 'Giá trị tối đa phải là số';
    }

    // Check if minValue is less than maxValue
    if (minValue && maxValue && !isNaN(Number(minValue)) && !isNaN(Number(maxValue))) {
      if (Number(minValue) >= Number(maxValue)) {
        newErrors.general = 'Giá trị tối thiểu phải nhỏ hơn giá trị tối đa';
      }
    }

    // Special validation for pH
    if (type === 'Ph') {
      if (minValue && !isNaN(Number(minValue)) && (Number(minValue) < 0 || Number(minValue) > 14)) {
        newErrors.minValue = 'Giá trị pH phải nằm trong khoảng từ 0 đến 14';
      }
      if (maxValue && !isNaN(Number(maxValue)) && (Number(maxValue) < 0 || Number(maxValue) > 14)) {
        newErrors.maxValue = 'Giá trị pH phải nằm trong khoảng từ 0 đến 14';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Đảm bảo type không là chuỗi rỗng
      if (!type) {
        setErrors({
          ...errors,
          type: 'Loại là bắt buộc'
        });
        return;
      }

      // Tạo đối tượng dữ liệu để gửi lên server
      const data = {
        type: type,
        minValue: Number(minValue),
        maxValue: Number(maxValue),
      };

      console.log('Submitting data:', data);
      
      // Gọi API để tạo giá trị mục tiêu mới
      const response = await targetValueService.createTargetValue(data);
      console.log('Create response:', response);

      // Đóng modal sau khi tạo thành công
      handleClose();
      
      // Đặt timeout để đảm bảo dữ liệu được cập nhật trên server
      // trước khi làm mới danh sách
      setTimeout(() => {
        onSuccess();
      }, 500);
      
    } catch (error: any) {
      console.error('Error creating target value:', error);

      // Extract error message if available
      let errorMessage = 'Đã xảy ra lỗi khi tạo giá trị mục tiêu';
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
          <Typography variant="h6">Thêm giá trị mục tiêu mới</Typography>
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
          <FormControl fullWidth error={!!errors.type} sx={{ mb: 3 }}>
            <InputLabel id="type-label">Loại</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              label="Loại"
              onChange={(e) => setType(e.target.value as ValueType)}
              disabled={loading}
            >
              <MenuItem value="SoluteConcentration">Nồng độ dung dịch</MenuItem>
              <MenuItem value="Temperature">Nhiệt độ nước</MenuItem>
              <MenuItem value="Ph">pH</MenuItem>
              <MenuItem value="WaterLevel">Mực nước</MenuItem>
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>

          <TextField
            label="Giá trị tối thiểu"
            fullWidth
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            error={!!errors.minValue}
            helperText={errors.minValue}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: type ? <InputAdornment position="end">{getUnitForType(type)}</InputAdornment> : null,
            }}
            disabled={loading}
            type="number"
          />

          <TextField
            label="Giá trị tối đa"
            fullWidth
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            error={!!errors.maxValue}
            helperText={errors.maxValue}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: type ? <InputAdornment position="end">{getUnitForType(type)}</InputAdornment> : null,
            }}
            disabled={loading}
            type="number"
          />
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

export default TargetValueModal;
