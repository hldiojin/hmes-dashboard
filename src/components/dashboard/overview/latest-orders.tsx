import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import dayjs from 'dayjs';

import { formatCurrency, getOrderStatusLabel, OrderStatus } from '@/types/order';
import { paths } from '@/paths';

// Define status colors similar to order table
const getStatusColor = (
  status: OrderStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Delivering':
      return 'info';
    case 'Success':
      return 'success';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export interface Order {
  id: string;
  reference: string;
  customer: { name: string };
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: SxProps;
  onViewAll?: () => void;
}

export function LatestOrders({ orders = [], sx, onViewAll }: LatestOrdersProps): React.JSX.Element {
  const router = useRouter();

  const handleViewOrder = (orderId: string) => {
    router.push(`${paths.dashboard.order}/${orderId}`);
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Đơn hàng gần đây" titleTypographyProps={{ variant: 'h6' }} />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'background.paper',
                '& th': {
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  py: 1.5,
                },
              }}
            >
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tổng tiền</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Không tìm thấy đơn hàng
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow hover key={order.id}>
                  <TableCell>{order.reference}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon size={16} />
                      {dayjs(order.createdAt).format('DD MMM YYYY')}
                    </Box>
                  </TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>
                    <Chip label={getOrderStatusLabel(order.status)} color={getStatusColor(order.status)} size="small" />
                  </TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}></CardActions>
    </Card>
  );
}
