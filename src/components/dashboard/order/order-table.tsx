'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { Funnel as FilterIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { OrdersFilter } from '../../../services/orderService';
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  isValidOrderStatus,
  Order,
  OrderStatus,
  PaymentMethod,
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

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onViewOrder: (orderId: string) => void;
  onFilterChange: (filters: OrdersFilter) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export default function OrderTable({
  orders,
  loading,
  onRefresh,
  onError,
  onSuccess,
  onViewOrder,
  onFilterChange,
  pagination,
}: OrderTableProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Local state for pagination that doesn't trigger effects
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use refs to prevent unnecessary re-renders
  const isInitialMount = useRef(true);
  const filtersRef = useRef<OrdersFilter>({
    keyword,
    status: statusFilter,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    pageIndex: page + 1,
    pageSize: rowsPerPage,
  });

  // Update component when pagination changes from parent
  useEffect(() => {
    if (pagination && pagination.currentPage > 0) {
      setPage(pagination.currentPage - 1);
    }
    if (pagination && pagination.pageSize > 0) {
      setRowsPerPage(pagination.pageSize);
    }
  }, [pagination]);

  // Memoize filter change to prevent infinite loops
  const handleFilterChange = useCallback(
    (newFilters: OrdersFilter) => {
      // Make sure status is properly typed before assigning to handle all cases
      let status = newFilters.status as OrderStatus | '' | undefined;

      filtersRef.current = {
        ...filtersRef.current,
        ...newFilters,
        status,
      };
      onFilterChange(filtersRef.current);
    },
    [onFilterChange]
  );

  // Only triggers on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);

    handleFilterChange({
      keyword,
      status: statusFilter || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      pageIndex: 1, // Reset to first page
      pageSize: rowsPerPage,
    });
  };

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);

    // Update only the page number, preserving existing filters
    handleFilterChange({
      ...filtersRef.current,
      pageIndex: newPage + 1,
    });
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setPage(0);

    // Update page size and reset to first page, preserving existing filters
    handleFilterChange({
      ...filtersRef.current,
      pageIndex: 1,
      pageSize: newPageSize,
    });
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    onViewOrder(orderId);
  };

  // Handle refresh button click
  const handleRefreshClick = () => {
    // Reset all filters
    setKeyword('');
    setStatusFilter('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
    setPage(0);

    // Call API with reset filters
    handleFilterChange({
      pageIndex: 1,
      pageSize: rowsPerPage,
    });

    onRefresh();
  };

  // Toggle advanced filters visibility
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersOpen(!advancedFiltersOpen);
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Search Order"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Order ID, customer name, phone, or address"
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={toggleAdvancedFilters} size="small" sx={{ mr: 1 }} color="primary">
                          <FilterIcon />
                          {advancedFiltersOpen ? <CaretUpIcon /> : <CaretDownIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => {
                        setStatusFilter(e.target.value as OrderStatus | '');
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Delivering">Delivering</MenuItem>
                      <MenuItem value="Success">Success</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Collapse in={advancedFiltersOpen}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Min Price"
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Max Price"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="1000"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleRefreshClick} startIcon={<SearchIcon />}>
                    Reset Filters
                  </Button>
                  <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
                    Search
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon size={16} />
                        {formatDate(order.date)}
                      </Box>
                    </TableCell>
                    <TableCell>{order.fullName || order.userId}</TableCell>
                    <TableCell>
                      <Box sx={{ position: 'relative', width: '100%', minWidth: 120 }}>
                        {/* Status Progress Visual */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor:
                                order.status === 'Pending'
                                  ? 'primary.main'
                                  : order.status === 'Cancelled'
                                    ? 'grey.500'
                                    : 'success.main',
                              border: '2px solid',
                              borderColor:
                                order.status === 'Pending'
                                  ? 'primary.light'
                                  : order.status === 'Cancelled'
                                    ? 'grey.300'
                                    : order.status === 'Delivering'
                                      ? 'primary.main'
                                      : 'success.light',
                            }}
                          />
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor:
                                order.status === 'Delivering' || order.status === 'Success'
                                  ? 'primary.main'
                                  : 'grey.300',
                              border: '2px solid',
                              borderColor:
                                order.status === 'Delivering'
                                  ? 'primary.light'
                                  : order.status === 'Success'
                                    ? 'success.light'
                                    : 'grey.200',
                            }}
                          />
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: order.status === 'Success' ? 'success.main' : 'grey.300',
                              border: '2px solid',
                              borderColor: order.status === 'Success' ? 'success.light' : 'grey.200',
                            }}
                          />
                          {order.status === 'Cancelled' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                                border: '2px solid',
                                borderColor: 'error.light',
                                top: 0,
                                right: 0,
                              }}
                            />
                          )}
                        </Box>
                        <Chip
                          label={getOrderStatusLabel(order.status as OrderStatus)}
                          color={getStatusColor(order.status as OrderStatus)}
                          size="small"
                          title="Order Status: Refers to delivery progress"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewOrderDetails(order.id)}
                        startIcon={<EyeIcon />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
        />
      </Card>
    </>
  );
}
