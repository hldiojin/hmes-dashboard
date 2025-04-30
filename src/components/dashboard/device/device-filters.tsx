'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

export interface DeviceFiltersProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
}

export function DeviceFilters({
  onSearchChange,
  searchValue,
}: DeviceFiltersProps): React.JSX.Element {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box>
        <TextField
          fullWidth
          label="Tìm kiếm thiết bị"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Tìm theo tên hoặc mô tả thiết bị..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Card>
  );
} 