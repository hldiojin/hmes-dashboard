import * as React from 'react';
import ArrowDownIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpIcon from '@mui/icons-material/ArrowUpward';
import CurrencyDollarIcon from '@mui/icons-material/AttachMoney';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

interface BudgetProps {
  difference?: number;
  positive?: boolean;
  sx?: SxProps;
  value: number;
}

export function Budget({ difference, positive = false, sx, value }: BudgetProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Revenue
            </Typography>
            <Typography variant="h4">
              {value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'error.main',
              height: 56,
              width: 56,
            }}
          >
            <CurrencyDollarIcon />
          </Avatar>
        </Stack>
        {difference && (
          <Stack alignItems="center" direction="row" spacing={2} sx={{ mt: 2 }}>
            {positive ? <ArrowUpIcon color="success" /> : <ArrowDownIcon color="error" />}
            <Typography color={positive ? 'success.main' : 'error.main'} variant="body2">
              {difference}%
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Since last month
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
