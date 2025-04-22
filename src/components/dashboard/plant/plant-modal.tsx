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
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Divider,
  IconButton,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';

import { Plant } from '@/types/plant';

interface PlantModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, status: 'Active' | 'Inactive', description?: string) => void;
  plant?: Plant;
  mode: 'create' | 'update';
}

function PlantModal({ open, onClose, onSubmit, plant, mode }: PlantModalProps): React.JSX.Element {
  const [name, setName] = React.useState<string>(plant?.name || '');
  const [description, setDescription] = React.useState<string>(plant?.description || '');
  // Always set status to 'Active' for create mode
  const [status, setStatus] = React.useState<'Active' | 'Inactive'>(
    mode === 'create' ? 'Active' : (plant?.status || 'Active')
  );
  const [errors, setErrors] = React.useState<{ name?: string; status?: string }>({});
  const [submitted, setSubmitted] = React.useState<boolean>(false);

  // Reset form when plant changes or mode changes
  React.useEffect(() => {
    if (plant) {
      setName(plant.name);
      setStatus(plant.status);
      setDescription(plant.description || '');
    } else {
      setName('');
      setDescription('');
      // Always set to Active for create mode
      setStatus(mode === 'create' ? 'Active' : 'Active');
    }
    setErrors({});
    setSubmitted(false);
  }, [plant, mode, open]);

  // Function to handle name change and clear error when user types
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Clear the name error if it exists and the field is not empty
    if (errors.name && value.trim()) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  // Function to validate the form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; status?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Tên cây trồng là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Always pass 'Active' as status for create mode
    if (mode === 'create') {
      onSubmit(name, 'Active', description);
    } else {
      onSubmit(name, status, description);
    }
  };

  // Function to handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{mode === 'create' ? 'Thêm cây trồng mới' : 'Cập nhật cây trồng'}</Typography>
          <IconButton onClick={onClose} size="small">
            <X fontSize="var(--icon-fontSize-md)" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Tên cây trồng"
            value={name}
            onChange={handleNameChange}
            error={submitted && !!errors.name}
            helperText={submitted && errors.name}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Mô tả"
            value={description}
            onChange={handleDescriptionChange}
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập mô tả chi tiết về cây trồng"
          />

          {/* Only show status selection for update mode */}
          {mode === 'update' && (
            <FormControl fullWidth>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Trạng thái"
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
              >
                <MenuItem value="Active">Hoạt động</MenuItem>
                <MenuItem value="Inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button type="button" variant="contained" color="primary" onClick={handleSubmit}>
          {mode === 'create' ? 'Thêm' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlantModal;
