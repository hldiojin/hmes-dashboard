'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets } from '@/services/ticketService';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';

import { Ticket, TicketResponse, TicketStatus, TicketType } from '@/types/ticket';

// Helper function to format dates in DD-MM-YYYY format
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format to DD-MM-YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

interface TicketListProps {
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
  endpoint?: string;
}

const TicketList: React.FC<TicketListProps> = ({ refreshTrigger = 0, onRefreshNeeded, endpoint = 'ticket' }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [keyword, setKeyword] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const router = useRouter();

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Check if we're showing transfer requests to hide filters
  const isTransferRequest = endpoint === 'ticket/transfer';

  // Function to translate ticket type to Vietnamese
  const translateType = (type: string): string => {
    switch (type) {
      case TicketType.Shopping:
        return 'Mua sắm';
      case TicketType.Technical:
        return 'Kỹ thuật';
      default:
        return type;
    }
  };

  // Function to translate ticket status to Vietnamese
  const translateStatus = (status: string): string => {
    switch (status) {
      case TicketStatus.Pending:
        return 'Đang chờ';
      case TicketStatus.InProgress:
        return 'Đang xử lý';
      case TicketStatus.Done:
        return 'Hoàn thành';
      case TicketStatus.Closed:
        return 'Đã đóng';
      case TicketStatus.IsTransferring:
        return 'Đang chuyển';
      case TicketStatus.TransferRejected:
        return 'Từ chối chuyển';
      default:
        return status;
    }
  };

  const fetchTickets = async (pageIndex: number = pagination.current, pageSize: number = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await getTickets(endpoint, keyword, typeFilter, statusFilter, pageIndex, pageSize);

      // Access the correct response structure
      if (response?.statusCodes === 200 && response?.response?.data) {
        setTickets(response.response.data);
        setPagination({
          current: response.response.currentPage || pageIndex,
          pageSize: response.response.pageSize || pageSize,
          total: response.response.totalItems || response.response.data.length || 0,
        });

        console.log('Pagination updated:', {
          current: response.response.currentPage || pageIndex,
          pageSize: response.response.pageSize || pageSize,
          total: response.response.totalItems || response.response.data.length || 0,
          totalPages: response.response.totalPages,
          lastPage: response.response.lastPage,
        });

        // Show success message for transfer ticket if applicable
        if (endpoint === 'ticket/transfer' && response.response.data.length > 0) {
          setSnackbar({
            open: true,
            message: 'Đã tải yêu cầu chuyển ticket thành công',
            severity: 'success',
          });
        }
      } else {
        console.error('Cấu trúc phản hồi không đúng định dạng:', response);
        setTickets([]);

        // Even if data is not available, use pagination info if present
        if (response?.response?.totalItems !== undefined) {
          setPagination({
            current: response.response.currentPage || 1,
            pageSize: response.response.pageSize || 10,
            total: response.response.totalItems || 0,
          });
        } else {
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }

        if (endpoint === 'ticket/transfer') {
          setSnackbar({
            open: true,
            message: 'Không tìm thấy yêu cầu chuyển ticket nào',
            severity: 'info',
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ticket:', error);
      setTickets([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });

      // Show error message
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi tải danh sách ticket',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(pagination.current, pagination.pageSize);
  }, [refreshTrigger, typeFilter, statusFilter, endpoint]);

  // Reset pagination and filters when endpoint changes
  useEffect(() => {
    // Reset to page 1 when switching tabs/endpoints
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    // Clear filters when switching tabs
    setKeyword('');
    setTypeFilter('');
    setStatusFilter('');
  }, [endpoint]);

  const handleSearch = () => {
    // Always start search from page 1
    fetchTickets(1, pagination.pageSize);
  };

  const handleReset = () => {
    setKeyword('');
    setTypeFilter('');
    setStatusFilter('');
    fetchTickets(1, pagination.pageSize);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    console.log('Đã chọn loại ticket:', e.target.value);
    setTypeFilter(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    console.log('Đã chọn trạng thái ticket:', e.target.value);
    setStatusFilter(e.target.value);
  };

  const handlePaginationChange = (_event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    fetchTickets(page + 1, pagination.pageSize);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      current: 1,
    }));
    // Then fetch tickets with the new page size
    fetchTickets(1, newPageSize);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TicketStatus.InProgress:
        return 'primary';
      case TicketStatus.Done:
        return 'success';
      case TicketStatus.Pending:
        return 'warning';
      case TicketStatus.Closed:
        return 'info';
      case TicketStatus.IsTransferring:
        return 'secondary';
      case TicketStatus.TransferRejected:
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm ticket"
            value={keyword}
            onChange={handleKeywordChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} size="small" aria-label="search">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />

          {!isTransferRequest && (
            <>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="type-filter-label">Loại</InputLabel>
                <Select labelId="type-filter-label" value={typeFilter} label="Loại" onChange={handleTypeChange}>
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value={TicketType.Shopping}>{TicketType.Shopping}</MenuItem>
                  <MenuItem value={TicketType.Technical}>{TicketType.Technical}</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value={TicketStatus.Pending}>Đang chờ</MenuItem>
                  <MenuItem value={TicketStatus.InProgress}>Đang xử lý</MenuItem>
                  <MenuItem value={TicketStatus.Done}>Hoàn thành</MenuItem>
                  <MenuItem value={TicketStatus.Closed}>Đã đóng</MenuItem>
                  <MenuItem value={TicketStatus.IsTransferring}>Đang chuyển</MenuItem>
                  <MenuItem value={TicketStatus.TransferRejected}>Từ chối chuyển</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>
              Làm mới
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người xử lý</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" py={2}>
                      Không tìm thấy ticket nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  return (
                    <TableRow
                      hover
                      key={ticket.id}
                      onClick={(event) => {
                        // Only navigate if the click wasn't on action buttons
                        if (!(event.target as HTMLElement).closest('.row-actions')) {
                          // Determine tab based on endpoint
                          let tab = '0';
                          if (endpoint === 'ticket/assigned') {
                            tab = '1';
                          } else if (endpoint === 'ticket/transfer') {
                            tab = '2';
                          }

                          // Store handledBy in localStorage before navigation
                          if (ticket.handledBy) {
                            localStorage.setItem(`ticket_${ticket.id}_handledBy`, ticket.handledBy);
                          }

                          router.push(`/dashboard/tickets/${ticket.id}?tab=${tab}`);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2">{ticket.id.slice(0, 8)}...</Typography>
                      </TableCell>
                      <TableCell>{ticket.userFullName}</TableCell>
                      <TableCell
                        sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {ticket.briefDescription}
                      </TableCell>
                      <TableCell>{translateType(ticket.type)}</TableCell>
                      <TableCell>
                        <Chip
                          label={translateStatus(ticket.status)}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.handledBy || '-'}</TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} justifyContent="flex-end" className="row-actions">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Determine tab based on endpoint
                                let tab = '0';
                                if (endpoint === 'ticket/assigned') {
                                  tab = '1';
                                } else if (endpoint === 'ticket/transfer') {
                                  tab = '2';
                                }

                                // Store handledBy in localStorage before navigation
                                if (ticket.handledBy) {
                                  localStorage.setItem(`ticket_${ticket.id}_handledBy`, ticket.handledBy);
                                }

                                router.push(`/dashboard/tickets/${ticket.id}?tab=${tab}`);
                              }}
                            >
                              <PencilSimple size={20} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={pagination.total || 0}
          onPageChange={handlePaginationChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={Math.max(0, (pagination.current || 1) - 1)}
          rowsPerPage={pagination.pageSize || 10}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : 'hơn ' + to}`}
        />
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TicketList;
