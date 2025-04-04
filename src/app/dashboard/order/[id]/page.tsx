'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { Order, OrderStatus } from '../../../../types/order';
import { getOrderById, updateOrderStatus } from '../../../../services/orderService';

const getStatusColor = (status: OrderStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const getOrderStatusStep = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return 0;
    case 'processing': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    case 'cancelled': return -1;
    default: return 0;
  }
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const orderId = params.id;

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setLoading(false);
      }
    };
    
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/order')}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6">Order not found</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const activeStep = getOrderStatusStep(order.status);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/order')}
        >
          Back to Orders
        </Button>
        <Chip
          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          color={getStatusColor(order.status)}
        />
      </Box>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Order #{order.orderNumber}
      </Typography>

      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Actions</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {order.status === 'pending' && (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled={updating}
                    onClick={() => handleUpdateStatus('processing')}
                  >
                    Process Order
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    disabled={updating}
                    onClick={() => handleUpdateStatus('cancelled')}
                  >
                    Cancel Order
                  </Button>
                </>
              )}
              {order.status === 'processing' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('shipped')}
                >
                  Mark as Shipped
                </Button>
              )}
              {order.status === 'shipped' && (
                <Button 
                  variant="contained" 
                  color="success"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('delivered')}
                >
                  Mark as Delivered
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/dashboard/order/${order.id}/edit`)}
                sx={{ mr: 1 }}
                disabled={(order.status as OrderStatus) === 'delivered' || (order.status as OrderStatus) === 'cancelled'}
              >
                Edit Order
              </Button>
              {updating && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Progress</Typography>
              {order.status === 'cancelled' ? (
                <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography>This order has been cancelled</Typography>
                </Box>
              ) : (
                <Stepper activeStep={activeStep} alternativeLabel>
                  <Step>
                    <StepLabel>Order Placed</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Processing</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Shipped</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Delivered</StepLabel>
                  </Step>
                </Stepper>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Order Number</Typography>
                  <Typography variant="body1">{order.orderNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Order Date</Typography>
                  <Typography variant="body1">{new Date(order.date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Customer ID</Typography>
                  <Typography variant="body1">{order.userId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1">{order.paymentMethod}</Typography>
                </Grid>
                {order.trackingNumber && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Tracking Number</Typography>
                    <Typography variant="body1">{order.trackingNumber}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Shipping Address</Typography>
              <Typography variant="body1">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Items</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="h6">
                  Total: ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}