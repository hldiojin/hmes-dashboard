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
  SelectChangeEvent,
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

  // Add a ref for debouncing search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize pagination from props
  useEffect(() => {
    if (pagination && pagination.currentPage > 0) {
      setPage(pagination.currentPage - 1);
    }
    if (pagination && pagination.pageSize > 0) {
      setRowsPerPage(pagination.pageSize);
    }
  }, [pagination]);

  // Apply filters when any filter changes
  const applyFilters = useCallback(() => {
    const filters: OrdersFilter = {
      pageIndex: page + 1,
      pageSize: rowsPerPage,
    };

    // Add all existing filters
    if (keyword.trim()) {
      filters.keyword = keyword.trim();
    }

    if (statusFilter) {
      filters.status = statusFilter;
    }

    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
    }

    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    console.log('Applying filters:', filters);
    onFilterChange(filters);
  }, [keyword, statusFilter, minPrice, maxPrice, startDate, endDate, page, rowsPerPage, onFilterChange]);

  // Handle input change for keyword with debounce
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only update state if value actually changed to prevent rerenders
    if (value !== keyword) {
      setKeyword(value);
      
      // Cancel previous timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      // Create new timeout with longer debounce
      searchTimeout.current = setTimeout(() => {
        console.log('Search keyword debounce triggered:', value);
        applyFilters();
      }, 800); // Increase debounce to 800ms
    }
  };

  // Handle status filter change
  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as OrderStatus | '';
    
    // Only update if the value actually changed
    if (value !== statusFilter) {
      setStatusFilter(value);
      
      // Apply filters after a short delay
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      searchTimeout.current = setTimeout(() => {
        applyFilters();
      }, 300); // Small delay for better UX
    }
  };

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (type: 'minPrice' | 'maxPrice' | 'startDate' | 'endDate', value: string) => {
    let shouldUpdate = false;
    
    switch (type) {
      case 'minPrice':
        if (value !== minPrice) {
          setMinPrice(value);
          shouldUpdate = true;
        }
        break;
      case 'maxPrice':
        if (value !== maxPrice) {
          setMaxPrice(value);
          shouldUpdate = true;
        }
        break;
      case 'startDate':
        if (value !== startDate) {
          setStartDate(value);
          shouldUpdate = true;
        }
        break;
      case 'endDate':
        if (value !== endDate) {
          setEndDate(value);
          shouldUpdate = true;
        }
        break;
    }

    // Only proceed if a value actually changed
    if (shouldUpdate) {
      // Apply filters with a longer debounce for numeric/date inputs
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      searchTimeout.current = setTimeout(() => {
        applyFilters();
      }, 1000); // Longer debounce (1s) for advanced filters
    }
  };

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setPage(0);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    onViewOrder(orderId);
  };

  // Toggle advanced filters visibility
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersOpen(!advancedFiltersOpen);
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Tìm kiếm đơn hàng"
                  value={keyword}
                  onChange={handleKeywordChange}
                  placeholder="Mã đơn hàng, tên khách hàng, điện thoại, hoặc địa chỉ"
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} size={20} />
                    ),
                    endAdornment: (
                      <IconButton onClick={toggleAdvancedFilters} size="small" sx={{ mr: 1 }} color="primary">
                        <FilterIcon />
                        {advancedFiltersOpen ? <CaretUpIcon /> : <CaretDownIcon />}
                      </IconButton>
                    ),
                  }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                  <Select<string>
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="Pending">Chờ xử lý</MenuItem>
                    <MenuItem value="Delivering">Đang giao</MenuItem>
                    <MenuItem value="Success">Thành công</MenuItem>
                    <MenuItem value="Cancelled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Collapse in={advancedFiltersOpen}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Giá nhỏ nhất"
                      type="number"
                      value={minPrice}
                      onChange={(e) => handleAdvancedFilterChange('minPrice', e.target.value)}
                      placeholder="0"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Giá lớn nhất"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => handleAdvancedFilterChange('maxPrice', e.target.value)}
                      placeholder="1000"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Từ ngày"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => handleAdvancedFilterChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Đến ngày"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => handleAdvancedFilterChange('endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Thao tác</TableCell>
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
                      Không tìm thấy đơn hàng nào
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
                          title="Trạng thái đơn hàng: Thể hiện tiến độ giao hàng"
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
                        Xem thêm
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
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </Card>
    </>
  );
}
