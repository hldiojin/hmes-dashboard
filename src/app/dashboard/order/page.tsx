'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { getOrders, deleteOrder } from '../../../services/orderService';
import { Order, OrderStatus } from '../../../types/order';

// Helper function to get status color
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setErrorMessage('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [refreshTrigger]);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesKeyword = 
      keyword === '' || 
      order.orderNumber.toLowerCase().includes(keyword.toLowerCase()) ||
      order.id.toLowerCase().includes(keyword.toLowerCase());
    
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    
    return matchesKeyword && matchesStatus;
  });

  // Paginate the filtered orders
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    router.push(`/dashboard/order/${orderId}`);
  };

  // Handle create new order
  const handleCreateOrder = () => {
    router.push('/dashboard/order/create');
  };

  // Handle delete order
  const handleDeleteClick = (orderId: string) => {
    const orderToBeDeleted = orders.find(order => order.id === orderId);
    if (orderToBeDeleted) {
      console.log(`Attempting to delete order: ${orderToBeDeleted.orderNumber}`);
      setOrderToDelete(orderId);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    console.log(`Confirming deletion of order: ${orderToDelete}`);
    setIsDeleting(true);
    
    try {
      const result = await deleteOrder(orderToDelete);
      console.log('Delete operation result:', result);
      
      if (result) {
        // Success - remove from local state
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete));
        setSuccessMessage('Order deleted successfully');
        console.log('Order deleted from state');
      } else {
        throw new Error('Delete operation returned false');
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      setErrorMessage('Failed to delete order. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  // Handle close alerts
  const handleCloseAlert = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4} sx={{ mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
        <Button
          startIcon={<PlusIcon />}
          variant="contained"
          onClick={handleCreateOrder}
        >
          New Order
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Search Order"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Order number, ID"
                sx={{ width: 300 }}
                InputProps={{
                  endAdornment: (
                    <Button type="submit" variant="text" sx={{ minWidth: 'auto' }}>
                      <SearchIcon />
                    </Button>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value as OrderStatus | '');
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" onClick={handleRefresh}>
                Refresh
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EyeIcon />}
                          onClick={() => handleViewOrderDetails(order.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant={order.status === 'shipped' || order.status === 'delivered' ? 'outlined' : 'contained'}
                          color="error"
                          size="small"
                          startIcon={<TrashIcon />}
                          onClick={() => handleDeleteClick(order.id)}
                          disabled={order.status === 'shipped' || order.status === 'delivered'}
                          title={order.status === 'shipped' || order.status === 'delivered' ? 
                            'Cannot delete shipped or delivered orders' : 'Delete this order'}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1">
                      {keyword || statusFilter ? 'No matching orders found' : 'No orders found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order? This action cannot be undone.
            {orderToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" component="div">
                  Order: {orders.find(o => o.id === orderToDelete)?.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {orders.find(o => o.id === orderToDelete)?.status}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error snackbar */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={3000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}