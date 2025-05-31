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

  // Local pagination state
  const [page, setPage] = useState(0); // MUI uses 0-indexed pages
  const [rowsPerPage, setRowsPerPage] = useState(pagination.pageSize || 10);

  // Add a ref for debouncing search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize pagination from props
  useEffect(() => {
    if (pagination.currentPage > 0) {
      setPage(pagination.currentPage - 1);
    }
    if (pagination.pageSize > 0) {
      setRowsPerPage(pagination.pageSize);
    }
  }, [pagination]);

  // Central function to build filters consistently
  const buildFilters = (
    pageIndex: number,
    customPageSize?: number,
    overrideStatus?: OrderStatus | '',
    overrideKeyword?: string
  ): OrdersFilter => {
    try {
      const filters: OrdersFilter = {
        pageIndex: Math.max(1, pageIndex || 1),
        pageSize: customPageSize || rowsPerPage || 10,
      };

      // Handle keyword - use override if provided
      const keywordToUse = overrideKeyword !== undefined ? overrideKeyword : (keyword || '').trim();
      if (keywordToUse && keywordToUse.length > 0) {
        filters.keyword = keywordToUse;
      }

      // Use override status if provided, otherwise use component state
      const statusToUse = overrideStatus !== undefined ? overrideStatus : statusFilter;

      // Only include status if it's not empty
      if (statusToUse && statusToUse.length > 0) {
        filters.status = statusToUse;
      }

      // Add price filters if they exist
      if (minPrice && minPrice.length > 0) {
        try {
          const minPriceNum = parseFloat(minPrice);
          if (!isNaN(minPriceNum)) {
            filters.minPrice = minPriceNum;
          }
        } catch (e) {
          console.warn('Invalid minPrice value:', minPrice);
        }
      }

      if (maxPrice && maxPrice.length > 0) {
        try {
          const maxPriceNum = parseFloat(maxPrice);
          if (!isNaN(maxPriceNum)) {
            filters.maxPrice = maxPriceNum;
          }
        } catch (e) {
          console.warn('Invalid maxPrice value:', maxPrice);
        }
      }

      // Add date filters if they exist
      if (startDate && startDate.length > 0) {
        filters.startDate = startDate;
      }

      if (endDate && endDate.length > 0) {
        filters.endDate = endDate;
      }

      return filters;
    } catch (error) {
      console.error('Error building filters:', error);
      // Return minimal valid filters as fallback
      return {
        pageIndex: pageIndex || 1,
        pageSize: customPageSize || rowsPerPage || 10,
      };
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update the keyword state without triggering search
    setKeyword(value);
  };

  // Add a function to handle Enter key press
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only trigger search on Enter key
    if (e.key === 'Enter') {
      // Safely get the current input value
      let inputValue = '';

      try {
        // Try to get value from event, fall back to state if needed
        if (e.currentTarget && typeof e.currentTarget.value === 'string') {
          inputValue = e.currentTarget.value.trim();
        } else {
          inputValue = keyword.trim();
        }
      } catch (error) {
        // If any error occurs, fall back to component state
        console.error('Error accessing input value from event:', error);
        inputValue = keyword.trim();
      }
      // Create base filters
      const filters: OrdersFilter = {
        pageIndex: 1,
        pageSize: rowsPerPage,
      };

      // IMPORTANT: Set keyword to empty string explicitly when empty to clear previous value
      filters.keyword = inputValue;

      // Add other filters
      if (statusFilter) {
        filters.status = statusFilter;
      }

      if (minPrice && minPrice.length > 0) {
        try {
          const minPriceNum = parseFloat(minPrice);
          if (!isNaN(minPriceNum)) {
            filters.minPrice = minPriceNum;
          }
        } catch (e) {
          console.warn('Invalid minPrice value:', minPrice);
        }
      }

      if (maxPrice && maxPrice.length > 0) {
        try {
          const maxPriceNum = parseFloat(maxPrice);
          if (!isNaN(maxPriceNum)) {
            filters.maxPrice = maxPriceNum;
          }
        } catch (e) {
          console.warn('Invalid maxPrice value:', maxPrice);
        }
      }

      if (startDate && startDate.length > 0) {
        filters.startDate = startDate;
      }

      if (endDate && endDate.length > 0) {
        filters.endDate = endDate;
      }
      onFilterChange(filters);
    }
  };

  // Handle status filter change
  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as OrderStatus | '';

    // Create filters using the NEW status value BEFORE updating state
    const filters = buildFilters(1, undefined, value);
    // Update the local state AFTER creating filters
    setStatusFilter(value);
    // Send the filters to parent
    onFilterChange(filters);
  };

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (type: 'minPrice' | 'maxPrice' | 'startDate' | 'endDate', value: string) => {
    // Cancel previous timeout to avoid race conditions
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Update state based on filter type
    switch (type) {
      case 'minPrice':
        setMinPrice(value);
        break;
      case 'maxPrice':
        setMaxPrice(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
    }

    searchTimeout.current = setTimeout(() => {
      const filters = buildFilters(1);
      onFilterChange(filters);
    }, 500);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);

    const filters = buildFilters(newPage + 1);

    onFilterChange(filters);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setPage(0);
    const filters = buildFilters(1, newPageSize);

    onFilterChange(filters);
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    onViewOrder(orderId);
  };

  // Toggle advanced filters visibility
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersOpen(!advancedFiltersOpen);
  };

  // Function to execute search with current input value
  const executeSearch = () => {
    try {
      // Get current keyword from state
      const inputValue = (keyword || '').trim();

      // Create base filters
      const filters: OrdersFilter = {
        pageIndex: 1,
        pageSize: rowsPerPage,
      };

      // IMPORTANT: Set keyword to empty string explicitly when empty
      filters.keyword = inputValue;

      // Add other filters
      if (statusFilter) {
        filters.status = statusFilter;
      }

      if (minPrice && minPrice.length > 0) {
        try {
          const minPriceNum = parseFloat(minPrice);
          if (!isNaN(minPriceNum)) {
            filters.minPrice = minPriceNum;
          }
        } catch (e) {
          console.warn('Invalid minPrice value:', minPrice);
        }
      }

      if (maxPrice && maxPrice.length > 0) {
        try {
          const maxPriceNum = parseFloat(maxPrice);
          if (!isNaN(maxPriceNum)) {
            filters.maxPrice = maxPriceNum;
          }
        } catch (e) {
          console.warn('Invalid maxPrice value:', maxPrice);
        }
      }

      if (startDate && startDate.length > 0) {
        filters.startDate = startDate;
      }

      if (endDate && endDate.length > 0) {
        filters.endDate = endDate;
      }
      onFilterChange(filters);
    } catch (error) {
      console.error('Error during search execution:', error);
      onFilterChange({
        pageIndex: 1,
        pageSize: rowsPerPage,
        keyword: '',
      });
    }
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
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="Mã đơn hàng, tên khách hàng"
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <SearchIcon style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} size={20} />,
                    endAdornment: (
                      <>
                        <IconButton
                          onClick={executeSearch}
                          size="small"
                          sx={{ mr: 1 }}
                          color="primary"
                          title="Tìm kiếm"
                        >
                          <SearchIcon />
                        </IconButton>
                        <IconButton
                          onClick={toggleAdvancedFilters}
                          size="small"
                          sx={{ mr: 1 }}
                          color="primary"
                          title="Bộ lọc nâng cao"
                        >
                          <FilterIcon />
                          {advancedFiltersOpen ? <CaretUpIcon /> : <CaretDownIcon />}
                        </IconButton>
                      </>
                    ),
                  }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                  <Select<string>
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={(e) => {
                      handleStatusChange(e);
                    }}
                    onClick={() => console.log('Select clicked')}
                  >
                    <MenuItem
                      value=""
                      onClick={() => {
                        // Create filters with empty status BEFORE updating state
                        const filters = buildFilters(1, undefined, '');
                        // Update state AFTER creating filters
                        setStatusFilter('');
                        // Send filters to parent
                        onFilterChange(filters);
                      }}
                    >
                      Tất cả
                    </MenuItem>
                    <MenuItem value="Pending">Chờ xử lý</MenuItem>
                    <MenuItem value="PendingPayment">Chờ thanh toán</MenuItem>
                    <MenuItem value="Delivering">Đang giao</MenuItem>
                    <MenuItem value="AllowRepayment">Cho phép thanh toán lại</MenuItem>
                    <MenuItem value="Success">Thành công</MenuItem>
                    <MenuItem value="Cancelled">Đã hủy</MenuItem>
                    <MenuItem value="IsWaiting">Chờ xác nhận</MenuItem>
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
                                order.status === 'Pending' ||
                                order.status === 'IsWaiting' ||
                                order.status === 'PendingPayment' ||
                                order.status === 'AllowRepayment'
                                  ? 'warning.main'
                                  : order.status === 'Cancelled'
                                    ? 'grey.500'
                                    : 'success.main',
                              border: '2px solid',
                              borderColor:
                                order.status === 'Pending' ||
                                order.status === 'IsWaiting' ||
                                order.status === 'PendingPayment' ||
                                order.status === 'AllowRepayment'
                                  ? 'warning.light'
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
