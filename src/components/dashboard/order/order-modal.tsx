'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { OrderDetailsData } from '../../../services/orderService';
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getTransactionStatusColor,
  getTransactionStatusLabel,
  Order,
  OrderStatus,
  TransactionStatus,
} from '../../../types/order';

// Helper function to get status color
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

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsData | null;
  loading: boolean;
}

export default function OrderModal({ open, onClose, orderDetails, loading }: OrderModalProps) {
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!orderDetails) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>Order not found</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Get transaction info if available
  const transaction =
    orderDetails.transactions && orderDetails.transactions.length > 0 ? orderDetails.transactions[0] : null;

  // Get order status - use the dedicated status field
  const orderStatus = (orderDetails.status as OrderStatus) || 'Pending';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Order {orderDetails.orderId.slice(0, 8).toUpperCase()}</Typography>
          <Chip
            label={getOrderStatusLabel(orderStatus)}
            color={getStatusColor(orderStatus)}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Order Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {transaction ? formatDate(transaction.createdAt) : 'Not available'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body1">{formatCurrency(orderDetails.totalPrice)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1">
                {transaction ? getPaymentMethodLabel(transaction.paymentMethod) : 'Not available'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Transaction ID
              </Typography>
              <Typography variant="body1">
                {transaction ? transaction.transactionId.slice(0, 8).toUpperCase() : 'Not available'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Status Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {/* Order Status Process Visualization */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order Status (Delivery)
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  {/* Status Progress Track */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      mt: 3,
                      mb: 1,
                    }}
                  >
                    {/* Main Process Flow */}
                    <Box sx={{ width: '100%', position: 'absolute', top: '12px', left: 0, right: 0, zIndex: 1 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '6px',
                          bgcolor: 'grey.300',
                          position: 'relative',
                        }}
                      >
                        {/* Progress Bar */}
                        <Box
                          sx={{
                            position: 'absolute',
                            height: '100%',
                            bgcolor: 'primary.main',
                            width:
                              orderStatus === 'Pending'
                                ? '0%'
                                : orderStatus === 'Delivering'
                                  ? '50%'
                                  : orderStatus === 'Success'
                                    ? '100%'
                                    : '0%',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Steps */}
                    <Box
                      sx={{
                        zIndex: 3,
                        bgcolor:
                          orderStatus === 'Pending'
                            ? 'primary.main'
                            : orderStatus === 'Cancelled'
                              ? 'grey.400'
                              : 'success.main',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '4px solid',
                        borderColor: 'background.paper',
                      }}
                    >
                      1
                    </Box>
                    <Box
                      sx={{
                        zIndex: 3,
                        bgcolor:
                          orderStatus === 'Delivering'
                            ? 'primary.main'
                            : orderStatus === 'Success'
                              ? 'success.main'
                              : 'grey.400',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '4px solid',
                        borderColor: 'background.paper',
                      }}
                    >
                      2
                    </Box>
                    <Box
                      sx={{
                        zIndex: 3,
                        bgcolor: orderStatus === 'Success' ? 'success.main' : 'grey.400',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '4px solid',
                        borderColor: 'background.paper',
                      }}
                    >
                      3
                    </Box>
                  </Box>

                  {/* Status Labels */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: orderStatus === 'Pending' ? 'bold' : 'regular',
                        color:
                          orderStatus === 'Pending'
                            ? 'primary.main'
                            : orderStatus === 'Cancelled'
                              ? 'text.secondary'
                              : 'text.secondary',
                      }}
                    >
                      Pending
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: orderStatus === 'Delivering' ? 'bold' : 'regular',
                        color: orderStatus === 'Delivering' ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      Delivering
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: orderStatus === 'Success' ? 'bold' : 'regular',
                        color: orderStatus === 'Success' ? 'success.main' : 'text.secondary',
                      }}
                    >
                      Success
                    </Typography>
                  </Box>

                  {/* Cancelled Status (if applicable) */}
                  {orderStatus === 'Cancelled' && (
                    <Box sx={{ mt: 2, pt: 0 }}>
                      <Chip
                        label="Cancelled"
                        color="error"
                        sx={{
                          fontWeight: 'medium',
                          py: 1,
                          px: 2,
                          fontSize: '0.875rem',
                        }}
                      />
                      <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                        This order has been cancelled
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Status
                </Typography>
                {transaction ? (
                  <Chip
                    label={getTransactionStatusLabel(transaction.paymentStatus)}
                    color={getTransactionStatusColor(transaction.paymentStatus)}
                    sx={{ fontWeight: 'medium' }}
                  />
                ) : (
                  <Chip label="No payment information" color="default" />
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              borderBottom: '1px solid #eaeaea',
              pb: 1,
              fontWeight: 600,
              color: '#333',
            }}
          >
            Shipping Address
          </Typography>
          {orderDetails.userAddress ? (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                  User:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                  {orderDetails.userAddress.name}
                </Typography>
                {orderDetails.userAddress.status === 'Default' && (
                  <Chip
                    label="Default"
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ ml: 2, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                  Phone:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {orderDetails.userAddress.phone}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                  Address:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {orderDetails.userAddress.address}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#888', fontStyle: 'italic', mt: 1 }}>
              No address information available
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Items
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Image</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetails.orderDetailsItems.map((item) => (
                  <TableRow key={item.orderDetailsId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="center">
                      {item.productImage ? (
                        <Card sx={{ width: 60, height: 60, mx: 'auto' }}>
                          <CardMedia
                            component="img"
                            height="60"
                            image={item.productImage}
                            alt={item.productName}
                            sx={{ objectFit: 'contain' }}
                          />
                        </Card>
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'grey.200',
                            mx: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            No image
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    Subtotal:
                  </TableCell>
                  <TableCell align="right">{formatCurrency(orderDetails.price)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    Shipping Fee:
                  </TableCell>
                  <TableCell align="right">{formatCurrency(orderDetails.shippingFee)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                    Total:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(orderDetails.totalPrice)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
