'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

export interface DeviceFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  searchValue: string;
  statusValue: string;
}

export function DeviceFilters({
  onSearchChange,
  onStatusChange,
  searchValue,
  statusValue,
}: DeviceFiltersProps): React.JSX.Element {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    onStatusChange(event.target.value);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
          gap: 3
        }}
      >
        <TextField
          fullWidth
          label="Tìm kiếm thiết bị"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Tìm theo tên, model, số serial..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl fullWidth>
          <InputLabel id="status-select-label">Trạng thái</InputLabel>
          <Select
            labelId="status-select-label"
            value={statusValue}
            onChange={handleStatusChange}
            label="Trạng thái"
            renderValue={(selected) => {
              if (!selected) {
                return "Tất cả";
              }
              return selected === "Active" ? "Hoạt động" : 
                     selected === "Inactive" ? "Không hoạt động" : 
                     selected === "Maintenance" ? "Bảo trì" : selected;
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Active">Hoạt động</MenuItem>
            <MenuItem value="Inactive">Không hoạt động</MenuItem>
            <MenuItem value="Maintenance">Bảo trì</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Card>
  );
} 