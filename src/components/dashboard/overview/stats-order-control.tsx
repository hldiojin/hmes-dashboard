'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface StatsOrderControlProps {
  currentValue: number;
  onChange: (value: number) => void;
  isLoading: boolean;
  sx?: SxProps;
}

const orderCountOptions = [
  { value: 20, label: '20 đơn hàng' },
  { value: 50, label: '50 đơn hàng' },
  { value: 100, label: '100 đơn hàng' },
  { value: 200, label: '200 đơn hàng' },
  { value: 500, label: '500 đơn hàng' },
];

export function StatsOrderControl({
  currentValue,
  onChange,
  isLoading,
  sx,
}: StatsOrderControlProps): React.JSX.Element {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1" color="text.secondary">
            Số lượng đơn hàng dùng để thống kê
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl fullWidth>
              <InputLabel id="stats-order-count-label">Số lượng đơn hàng</InputLabel>
              <Select
                labelId="stats-order-count-label"
                id="stats-order-count"
                value={currentValue}
                label="Số lượng đơn hàng"
                onChange={handleChange}
                disabled={isLoading}
              >
                {orderCountOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isLoading && (
              <Box display="flex" alignItems="center">
                <CircularProgress size={24} />
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
