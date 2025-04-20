'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import { TargetValue, ValueType, ValueTypeEnums } from '@/types/targetValue';

interface TargetValueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TargetValue>) => void;
  targetValue?: TargetValue;
  mode: 'create' | 'update';
}

function TargetValueModal({ open, onClose, onSubmit, targetValue, mode }: TargetValueModalProps): React.JSX.Element {
  const [type, setType] = React.useState<ValueType>(targetValue?.type || 'Ph');
  const [minValue, setMinValue] = React.useState<number | ''>(targetValue?.minValue ?? '');
  const [maxValue, setMaxValue] = React.useState<number | ''>(targetValue?.maxValue ?? '');
  const [errors, setErrors] = React.useState<{
    type?: string;
    minValue?: string;
    maxValue?: string;
  }>({});

  // Reset form when modal opens/closes or targetValue changes
  React.useEffect(() => {
    if (open) {
      setType(targetValue?.type || 'Ph');
      setMinValue(targetValue?.minValue ?? '');
      setMaxValue(targetValue?.maxValue ?? '');
      setErrors({});
    }
  }, [open, targetValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Validate min value
    if (minValue === '') {
      newErrors.minValue = 'Min value is required';
    } else if (typeof minValue === 'number' && minValue < 0) {
      newErrors.minValue = 'Min value must be greater than or equal to 0';
    }

    // Validate max value
    if (maxValue === '') {
      newErrors.maxValue = 'Max value is required';
    } else if (typeof maxValue === 'number' && maxValue < 0) {
      newErrors.maxValue = 'Max value must be greater than or equal to 0';
    }

    // Validate min-max relationship
    if (typeof minValue === 'number' && typeof maxValue === 'number' && minValue > maxValue) {
      newErrors.maxValue = 'Max value must be greater than min value';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formattedData = {
      type,
      minValue: typeof minValue === 'number' ? minValue : 0,
      maxValue: typeof maxValue === 'number' ? maxValue : 0,
      id: targetValue?.id // Include ID for updates
    };

    onSubmit(formattedData);
  };

  // Get target type display name
  const getTargetTypeDisplayName = (type: ValueType): string => {
    switch (type) {
      case 'Temperature':
        return 'Temperature';
      case 'SoluteConcentration':
        return 'Concentration of Solutes';
      case 'WaterLevel':
        return 'Water Level';
      case 'Ph':
        return 'pH';
      default:
        return type;
    }
  };

  // Get target type unit
  const getTargetTypeUnit = (type: ValueType): string => {
    switch (type) {
      case 'Temperature':
        return '°C';
      case 'SoluteConcentration':
        return 'ppm';
      case 'WaterLevel':
        return 'cm';
      case 'Ph':
        return '';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Create New Target Value' : 'Edit Target Value'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                value={type}
                label="Type"
                onChange={(e) => setType(e.target.value as ValueType)}
              >
                <MenuItem value="Ph">pH</MenuItem>
                <MenuItem value="SoluteConcentration">Concentration of Solutes</MenuItem>
                <MenuItem value="Temperature">Temperature</MenuItem>
                <MenuItem value="WaterLevel">Water Level</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Min Value"
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value === '' ? '' : Number(e.target.value))}
              error={!!errors.minValue}
              helperText={errors.minValue}
              fullWidth
              required
              InputProps={{
                endAdornment: getTargetTypeUnit(type),
              }}
            />

            <TextField
              label="Max Value"
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value === '' ? '' : Number(e.target.value))}
              error={!!errors.maxValue}
              helperText={errors.maxValue}
              fullWidth
              required
              InputProps={{
                endAdornment: getTargetTypeUnit(type),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default TargetValueModal;
