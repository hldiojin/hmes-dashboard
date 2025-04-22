'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

export interface UserFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  searchValue: string;
  statusValue: string;
  roleValue: string;
}

export function UserFilters({
  onSearchChange,
  onStatusChange,
  onRoleChange,
  searchValue,
  statusValue,
  roleValue,
}: UserFiltersProps): React.JSX.Element {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            ),
          }}
          placeholder="Tìm kiếm người dùng..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={statusValue}
            label="Trạng thái"
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{ height: 40 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Active">Hoạt động</MenuItem>
            <MenuItem value="Inactive">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Vai trò</InputLabel>
          <Select value={roleValue} label="Vai trò" onChange={(e) => onRoleChange(e.target.value)} sx={{ height: 40 }}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Consultant">Consultant</MenuItem>
            <MenuItem value="Technician">Technician</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Card>
  );
}
