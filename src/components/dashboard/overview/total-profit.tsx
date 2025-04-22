import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CurrencyCircleDollar as CurrencyCircleDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyCircleDollar';

export interface TotalProfitProps {
  sx?: SxProps;
  value: string;
}

export function TotalProfit({ sx, value }: TotalProfitProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={1} direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Tổng lợi nhuận
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <CurrencyCircleDollarIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
