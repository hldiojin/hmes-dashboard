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
} from '@mui/material';

import { Plant } from '@/types/plant';

interface PlantModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, status: 'Active' | 'Inactive') => void;
  plant?: Plant;
  mode: 'create' | 'update';
}

function PlantModal({ open, onClose, onSubmit, plant, mode }: PlantModalProps): React.JSX.Element {
  const [name, setName] = React.useState<string>(plant?.name || '');
  // Always set status to 'Active' for create mode
  const [status, setStatus] = React.useState<'Active' | 'Inactive'>(
    mode === 'create' ? 'Active' : (plant?.status || 'Active')
  );
  const [errors, setErrors] = React.useState<{ name?: string }>({});

  // Reset form when plant changes or mode changes
  React.useEffect(() => {
    if (plant) {
      setName(plant.name);
      setStatus(plant.status);
    } else {
      setName('');
      // Always set to Active for create mode
      setStatus(mode === 'create' ? 'Active' : 'Active');
    }
    setErrors({});
  }, [plant, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Always pass 'Active' as status for create mode
    if (mode === 'create') {
      onSubmit(name, 'Active');
    } else {
      onSubmit(name, status);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Create New Plant' : 'Edit Plant'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              autoFocus
            />

            {/* Only show status selection for update mode */}
            {mode === 'update' && (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
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

export default PlantModal;
