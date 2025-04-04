'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, Snackbar, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import OrderModal from '../../../components/dashboard/order/order-modal';
import OrderTable from '../../../components/dashboard/order/order-table';
import {
  getOrderDetails,
  getOrders,
  OrderDetailsData,
  OrdersFilter,
  PaginatedOrders,
} from '../../../services/orderService';
import { Order } from '../../../types/order';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetailsData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [filters, setFilters] = useState<OrdersFilter>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
    lastPage: true,
  });

  // Fetch orders with filters
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedOrders = await getOrders(filters);
      setOrders(response.orders);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        pageSize: response.pageSize,
        lastPage: response.lastPage,
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setErrorMessage('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: OrdersFilter) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Handle create new order
  const handleCreateOrder = () => {
    router.push('/dashboard/order/create');
  };

  // Handle close alerts
  const handleCloseAlert = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Handle view order details
  const handleViewOrderDetails = async (orderId: string) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      const orderDetailsData = await getOrderDetails(orderId);
      setSelectedOrderDetails(orderDetailsData);

      if (!orderDetailsData) {
        setErrorMessage('Order details not found.');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setErrorMessage('Failed to load order details. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrderDetails(null);
  };

  // Set success message
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  // Set error message
  const handleError = (message: string) => {
    setErrorMessage(message);
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
        <Button startIcon={<PlusIcon />} variant="contained" onClick={handleCreateOrder}>
          New Order
        </Button>
      </Stack>

      {/* Order Table Component */}
      <OrderTable
        orders={orders}
        loading={loading}
        onRefresh={handleRefresh}
        onError={handleError}
        onSuccess={handleSuccess}
        onViewOrder={handleViewOrderDetails}
        onFilterChange={handleFilterChange}
        pagination={pagination}
      />

      {/* Order Modal Component */}
      <OrderModal
        open={modalOpen}
        onClose={handleCloseModal}
        orderDetails={selectedOrderDetails}
        loading={modalLoading}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
