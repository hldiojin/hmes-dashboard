import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';

export interface TotalProfitProps {
  sx?: SxProps;
  value: string | number;
}

export function TotalProfit({ value, sx }: TotalProfitProps): React.JSX.Element {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : value;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Profit
            </Typography>
            <Typography variant="h4">{formattedValue}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
