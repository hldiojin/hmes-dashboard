'use client';

import React from 'react';
import {
  Alert,
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
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useUser } from '../../../hooks/use-user';
import { confirmOrderCOD, handleCheckDelivery, OrderDetailsData } from '../../../services/orderService';
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
    case 'PendingPayment':
      return 'info';
    case 'Delivering':
      return 'info';
    case 'AllowRepayment':
      return 'secondary';
    case 'Success':
      return 'success';
    case 'Cancelled':
      return 'error';
    case 'IsWaiting':
      return 'warning';
    default:
      return 'default';
  }
};

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsData | null;
  loading: boolean;
  onOrderUpdate?: () => void; // Callback to refresh the order list
}

export default function OrderModal({ open, onClose, orderDetails, loading, onOrderUpdate }: OrderModalProps) {
  const { user } = useUser();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [deliveryLoading, setDeliveryLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check if user has permission to confirm orders (Consultant or Admin)
  const canConfirmOrder = user && (user.role === 'Consultant' || user.role === 'Admin');

  // Handle order confirmation for COD orders
  const handleConfirmOrder = async (action: 'confirm' | 'cancel') => {
    if (!orderDetails) return;

    setConfirmLoading(true);
    try {
      const status = action === 'confirm' ? 'Delivering' : 'Cancelled';
      await confirmOrderCOD(orderDetails.orderId, status);

      setSnackbar({
        open: true,
        message: action === 'confirm' ? 'Đơn hàng đã được xác nhận thành công!' : 'Đơn hàng đã được hủy thành công!',
        severity: 'success',
      });

      // Call the update callback to refresh the order list
      if (onOrderUpdate) {
        onOrderUpdate();
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error confirming order:', error);

      // More specific error handling based on error message
      let errorMessage = 'Có lỗi xảy ra khi xử lý đơn hàng';
      if (error.message) {
        // The error message is already translated to Vietnamese in orderService
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle delivery confirmation for delivering orders
  const handleDeliveryConfirmation = async (action: 'complete' | 'cancel') => {
    if (!orderDetails) return;

    setDeliveryLoading(true);
    try {
      const status = action === 'complete' ? 'Success' : 'Cancelled';
      await handleCheckDelivery(orderDetails.orderId, status);

      setSnackbar({
        open: true,
        message: action === 'complete' ? 'Đơn hàng đã được hoàn thành thành công!' : 'Đơn hàng đã được hủy thành công!',
        severity: 'success',
      });

      // Call the update callback to refresh the order list
      if (onOrderUpdate) {
        onOrderUpdate();
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error handling delivery confirmation:', error);

      // More specific error handling based on error message
      let errorMessage = 'Có lỗi xảy ra khi xử lý giao hàng';
      if (error.message) {
        // The error message is already translated to Vietnamese in orderService
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!orderDetails) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>Không tìm thấy đơn hàng</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
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
          <Typography variant="h6">Đơn hàng {orderDetails.orderId.slice(0, 8).toUpperCase()}</Typography>
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
            Thông tin đơn hàng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Ngày đặt
              </Typography>
              <Typography variant="body1">
                {transaction ? formatDate(transaction.createdAt) : 'Không có thông tin'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Tổng tiền
              </Typography>
              <Typography variant="body1">{formatCurrency(orderDetails.totalPrice)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Phương thức thanh toán
              </Typography>
              <Typography variant="body1">
                {transaction ? getPaymentMethodLabel(transaction.paymentMethod) : 'Không có thông tin'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Mã giao dịch
              </Typography>
              <Typography variant="body1">
                {transaction ? transaction.transactionId.slice(0, 8).toUpperCase() : 'Không có thông tin'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Thông tin trạng thái
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {/* Order Status Process Visualization */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trạng thái đơn hàng (Vận chuyển)
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
                              orderStatus === 'IsWaiting' ||
                              orderStatus === 'Pending' ||
                              orderStatus === 'PendingPayment' ||
                              orderStatus === 'AllowRepayment'
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
                          orderStatus === 'IsWaiting' ||
                          orderStatus === 'Pending' ||
                          orderStatus === 'PendingPayment' ||
                          orderStatus === 'AllowRepayment'
                            ? 'warning.main'
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
                        fontWeight:
                          orderStatus === 'IsWaiting' ||
                          orderStatus === 'Pending' ||
                          orderStatus === 'PendingPayment' ||
                          orderStatus === 'AllowRepayment'
                            ? 'bold'
                            : 'regular',
                        color:
                          orderStatus === 'IsWaiting' ||
                          orderStatus === 'Pending' ||
                          orderStatus === 'PendingPayment' ||
                          orderStatus === 'AllowRepayment'
                            ? 'warning.main'
                            : orderStatus === 'Cancelled'
                              ? 'text.secondary'
                              : 'text.secondary',
                      }}
                    >
                      {orderStatus === 'IsWaiting'
                        ? 'Chờ xác nhận'
                        : orderStatus === 'PendingPayment'
                          ? 'Chờ thanh toán'
                          : orderStatus === 'AllowRepayment'
                            ? 'Cho phép thanh toán lại'
                            : 'Chờ xử lý'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: orderStatus === 'Delivering' ? 'bold' : 'regular',
                        color: orderStatus === 'Delivering' ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      Đang giao
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: orderStatus === 'Success' ? 'bold' : 'regular',
                        color: orderStatus === 'Success' ? 'success.main' : 'text.secondary',
                      }}
                    >
                      Thành công
                    </Typography>
                  </Box>

                  {/* Cancelled Status (if applicable) */}
                  {orderStatus === 'Cancelled' && (
                    <Box sx={{ mt: 2, pt: 0 }}>
                      <Chip
                        label="Đã hủy"
                        color="error"
                        sx={{
                          fontWeight: 'medium',
                          py: 1,
                          px: 2,
                          fontSize: '0.875rem',
                        }}
                      />
                      <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                        Đơn hàng này đã bị hủy
                      </Typography>
                    </Box>
                  )}

                  {/* IsWaiting Status with Action Buttons */}
                  {orderStatus === 'IsWaiting' && canConfirmOrder && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Đơn hàng này cần được xác nhận:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleConfirmOrder('confirm')}
                          disabled={confirmLoading || deliveryLoading}
                          startIcon={confirmLoading ? <CircularProgress size={16} /> : null}
                          sx={{
                            minWidth: 120,
                            '&:disabled': {
                              backgroundColor: 'grey.300',
                              color: 'grey.500',
                            },
                          }}
                        >
                          {confirmLoading ? 'Đang xử lý...' : 'Xác nhận'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleConfirmOrder('cancel')}
                          disabled={confirmLoading || deliveryLoading}
                          sx={{
                            minWidth: 80,
                            '&:disabled': {
                              borderColor: 'grey.300',
                              color: 'grey.500',
                            },
                          }}
                        >
                          {confirmLoading ? '...' : 'Hủy'}
                        </Button>
                      </Box>
                      {confirmLoading && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            Đang xử lý yêu cầu...
                          </Typography>
                          <CircularProgress size={16} />
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Delivering Status with Action Buttons */}
                  {orderStatus === 'Delivering' && canConfirmOrder && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Đơn hàng đang được giao - Xác nhận hoàn thành:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleDeliveryConfirmation('complete')}
                          disabled={deliveryLoading || confirmLoading}
                          startIcon={deliveryLoading ? <CircularProgress size={16} /> : null}
                          sx={{
                            minWidth: 120,
                            '&:disabled': {
                              backgroundColor: 'grey.300',
                              color: 'grey.500',
                            },
                          }}
                        >
                          {deliveryLoading ? 'Đang xử lý...' : 'Hoàn thành'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeliveryConfirmation('cancel')}
                          disabled={deliveryLoading || confirmLoading}
                          sx={{
                            minWidth: 80,
                            '&:disabled': {
                              borderColor: 'grey.300',
                              color: 'grey.500',
                            },
                          }}
                        >
                          {deliveryLoading ? '...' : 'Hủy'}
                        </Button>
                      </Box>
                      {deliveryLoading && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            Đang xử lý yêu cầu...
                          </Typography>
                          <CircularProgress size={16} />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trạng thái thanh toán
                </Typography>
                {transaction ? (
                  <Chip
                    label={getTransactionStatusLabel(transaction.paymentStatus)}
                    color={getTransactionStatusColor(transaction.paymentStatus)}
                    sx={{ fontWeight: 'medium' }}
                  />
                ) : (
                  <Chip label="Không có thông tin thanh toán" color="default" />
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
            Địa chỉ giao hàng
          </Typography>
          {orderDetails.userAddress ? (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                  Người nhận:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                  {orderDetails.userAddress.name}
                </Typography>
                {orderDetails.userAddress.status === 'Default' && (
                  <Chip
                    label="Mặc định"
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ ml: 2, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                  Điện thoại:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {orderDetails.userAddress.phone}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                  Địa chỉ:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {orderDetails.userAddress.address}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#888', fontStyle: 'italic', mt: 1 }}>
              Không có thông tin địa chỉ
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Sản phẩm
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="center">Hình ảnh</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
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
                            Không có ảnh
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
                    Tạm tính:
                  </TableCell>
                  <TableCell align="right">{formatCurrency(orderDetails.price)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    Phí vận chuyển:
                  </TableCell>
                  <TableCell align="right">{formatCurrency(orderDetails.shippingFee)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                    Tổng cộng:
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
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
