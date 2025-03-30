'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTicket, getTickets } from '@/services/ticketService';
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
import { PencilSimple, Trash } from '@phosphor-icons/react';

import { Ticket, TicketResponse, TicketStatus, TicketType } from '@/types/ticket';

function noop(): void {
  // do nothing
}

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

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Check if we're showing transfer requests to hide filters
  const isTransferRequest = endpoint === 'ticket/transfer';

  const fetchTickets = async (pageIndex: number = pagination.current, pageSize: number = pagination.pageSize) => {
    setLoading(true);
    try {
      console.log('Fetching tickets with params:', {
        endpoint,
        keyword,
        type: typeFilter,
        status: statusFilter,
        pageIndex,
        pageSize,
      });

      const response = await getTickets(endpoint, keyword, typeFilter, statusFilter, pageIndex, pageSize);
      console.log('Tickets API response:', response);

      // Access the correct response structure
      if (response?.statusCodes === 200 && response?.response?.data) {
        setTickets(response.response.data);
        setPagination({
          current: response.response.pageIndex || 1,
          pageSize: response.response.pageSize || 10,
          total: response.response.total || response.response.data.length || 0,
        });
      } else {
        console.error('Unexpected response structure:', response);
        setTickets([]);
        setPagination({
          current: 1,
          pageSize: 10,
          total: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
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
    fetchTickets(1, pagination.pageSize);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    setTypeFilter(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  const handlePaginationChange = (_event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    fetchTickets(page, pagination.pageSize);
  };

  // Handle delete button click
  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };

  // Handle confirmation dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteTicket(ticketToDelete.id);

      // Close dialog
      setDeleteDialogOpen(false);
      setTicketToDelete(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Ticket deleted successfully`,
        severity: 'success',
      });

      // Trigger refresh either through callback or internal refresh
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        // Refresh the list internally
        fetchTickets(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete ticket',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle snackbar close
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
            placeholder="Search tickets"
            value={keyword}
            onChange={handleKeywordChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />

          {!isTransferRequest && (
            <>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select labelId="type-filter-label" value={typeFilter} label="Type" onChange={handleTypeChange}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value={TicketType.Shopping}>{TicketType.Shopping}</MenuItem>
                  <MenuItem value={TicketType.Technical}>{TicketType.Technical}</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select labelId="status-filter-label" value={statusFilter} label="Status" onChange={handleStatusChange}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value={TicketStatus.Pending}>Pending</MenuItem>
                  <MenuItem value={TicketStatus.InProgress}>In Progress</MenuItem>
                  <MenuItem value={TicketStatus.Done}>Done</MenuItem>
                  <MenuItem value={TicketStatus.Closed}>Closed</MenuItem>
                  <MenuItem value={TicketStatus.IsTransferring}>Is Transferring</MenuItem>
                  <MenuItem value={TicketStatus.TransferRejected}>Transfer Rejected</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchTickets(pagination.current, pagination.pageSize)}
            >
              Refresh
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
                <TableCell>User</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Handled By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" py={2}>
                      No tickets found
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
                      <TableCell>{ticket.type}</TableCell>
                      <TableCell>
                        <Chip label={ticket.status} color={getStatusColor(ticket.status)} size="small" />
                      </TableCell>
                      <TableCell>{ticket.handledBy || '-'}</TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} justifyContent="flex-end" className="row-actions">
                          <Tooltip title="View details">
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
                          <Tooltip title="Delete ticket">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(ticket);
                              }}
                            >
                              <Trash size={20} />
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
          onRowsPerPageChange={noop}
          page={pagination.current > 0 ? pagination.current - 1 : 0}
          rowsPerPage={pagination.pageSize || 10}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : 'more than ' + to}`}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Ticket</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this ticket? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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
