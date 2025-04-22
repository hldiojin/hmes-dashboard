'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  assignTicket,
  changeTicketStatus,
  getStaffs,
  getTicketById,
  manageTransferTicket,
  responseTicket,
  transferTicket,
  updateTicket,
} from '@/services/ticketService';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowsClockwise,
  CheckCircle,
  File,
  FileDoc,
  FileImage,
  FilePdf,
  FileText,
  PaperPlaneRight,
  UserCirclePlus,
  XCircle,
} from '@phosphor-icons/react/dist/ssr';

import { Staff, StaffListResponse, Ticket, TicketResponse, TicketStatus } from '@/types/ticket';

// Helper function to get file icon based on file extension
const getFileIcon = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return <FilePdf size={24} />;
    case 'doc':
    case 'docx':
      return <FileDoc size={24} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FileImage size={24} />;
    case 'txt':
      return <FileText size={24} />;
    default:
      return <File size={24} />;
  }
};

// Helper function to get file name from URL
const getFileName = (url: string) => {
  const pathParts = url.split('/');
  return pathParts[pathParts.length - 1];
};

// Helper function to check if file is an image
const isImageFile = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
};

function TicketDetail(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;
  const [loading, setLoading] = React.useState(true);
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [storedHandledBy, setStoredHandledBy] = React.useState<string | null>(null);

  // Response form state
  const [responseMessage, setResponseMessage] = React.useState('');
  const [responseAttachments, setResponseAttachments] = React.useState<File[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Additional state for action buttons
  const [acceptingTransfer, setAcceptingTransfer] = React.useState(false);
  const [rejectingTransfer, setRejectingTransfer] = React.useState(false);
  const [assigningTicket, setAssigningTicket] = React.useState(false);

  // Transfer dialog state
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferring, setTransferring] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState('Consultant');
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = React.useState('');
  const [loadingStaff, setLoadingStaff] = React.useState(false);

  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<TicketStatus | ''>('');
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  // Get the current path to determine which tab we're in
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const tabParam = searchParams.get('tab');

  const isTransferRequest = tabParam === '2';
  const isAssignedTicket = tabParam === '1';
  const isAllTickets = tabParam === '0' || !tabParam;

  // Log tab and ticket status for debugging
  React.useEffect(() => {
    if (ticket) {
      console.log('TICKET DEBUG INFO:', {
        ticketId: ticket.id,
        ticketStatus: ticket.status,
        ticketStatusType: typeof ticket.status,
        ticketStatusEnum: TicketStatus.IsTransferring,
        ticketStatusEqual: ticket.status === TicketStatus.IsTransferring,
        ticketStatusStringEqual: ticket.status === 'IsTransferring',
        tabParam,
        isTransferRequest,
        isAssignedTicket,
        isAllTickets,
      });
    }
  }, [ticket, tabParam, isTransferRequest, isAssignedTicket, isAllTickets]);

  // Determine the back navigation path
  const getBackPath = () => {
    if (isTransferRequest) {
      return '/dashboard/tickets?tab=2&refresh=true'; // Transfer Requests tab
    } else if (isAssignedTicket) {
      return '/dashboard/tickets?tab=1&refresh=true'; // Assigned Tickets tab
    } else {
      return '/dashboard/tickets?tab=0&refresh=true'; // All Tickets tab
    }
  };

  // Check if response should be allowed
  const canRespond = ticket?.status === TicketStatus.InProgress || ticket?.status === TicketStatus.TransferRejected;

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // State for navigation after operations
  const [navigationTarget, setNavigationTarget] = React.useState<string | null>(null);
  const [navigationAttempted, setNavigationAttempted] = React.useState(false);

  // Handle navigation after operations complete
  React.useEffect(() => {
    if (navigationTarget && !navigationAttempted) {
      console.log(`Attempting navigation to: ${navigationTarget}`);
      setNavigationAttempted(true);

      // Use both router.push and fallback to window.location if needed
      try {
        router.push(navigationTarget);
        console.log('Navigation initiated with router.push');

        // Fallback - if router.push doesn't trigger navigation quickly enough
        const fallbackTimer = setTimeout(() => {
          console.log('Navigation fallback triggered - using window.location');
          window.location.href = navigationTarget;
        }, 1000);

        return () => clearTimeout(fallbackTimer);
      } catch (err) {
        console.error('Navigation error:', err);
        // Direct fallback
        window.location.href = navigationTarget;
      }
    }
  }, [navigationTarget, navigationAttempted, router]);

  React.useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        console.log('Fetching ticket with ID:', ticketId);

        // Try to get stored handledBy from localStorage
        if (typeof window !== 'undefined') {
          const storedValue = localStorage.getItem(`ticket_${ticketId}_handledBy`);
          if (storedValue) {
            setStoredHandledBy(storedValue);
            // Clean up localStorage after retrieving the value
            localStorage.removeItem(`ticket_${ticketId}_handledBy`);
          }
        }

        const data = await getTicketById(ticketId);
        console.log('Ticket detail response:', data);

        // Handle response structure
        if (data && data.statusCodes === 200 && data.response?.data) {
          setTicket(data.response.data);
        } else {
          console.error('Invalid ticket data structure:', data);
          setError('Ticket data has an unexpected format');
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponseMessage(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Instead of replacing files, append the new ones to the existing array
      const newFiles = Array.from(e.target.files);
      setResponseAttachments((prev) => [...prev, ...newFiles]);

      // Reset the file input so the same files can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = (index: number) => {
    setResponseAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responseMessage.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a response message',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('ticketId', ticketId);
      formData.append('message', responseMessage);

      // Log attachment info
      console.log(
        `Adding ${responseAttachments.length} attachments to response:`,
        responseAttachments.map((file) => ({ name: file.name, size: file.size, type: file.type }))
      );

      // Add attachments if any
      responseAttachments.forEach((file, index) => {
        console.log(`Appending file ${index + 1}/${responseAttachments.length}: ${file.name}`);
        formData.append('attachments', file);
      });

      // Submit response
      const result = await responseTicket(formData);
      console.log('Response submitted:', result);

      // Update the ticket with new response
      if (result && result.response && result.response.data) {
        setTicket(result.response.data);
        setResponseMessage('');
        setResponseAttachments([]);

        setSnackbar({
          open: true,
          message: 'Response submitted successfully',
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit response',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'InProgress':
        return 'primary';
      case 'Done':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Closed':
        return 'info';
      case 'IsTransferring':
        return 'secondary';
      case 'TransferRejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handler for accepting transfer
  const handleAcceptTransfer = async () => {
    if (!ticket) return;

    setAcceptingTransfer(true);
    try {
      const result = await manageTransferTicket(ticketId, true);
      console.log('Transfer accepted result:', result);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Transfer request accepted',
        severity: 'success',
      });

      // Reset navigation state and set new target
      setNavigationAttempted(false);
      setNavigationTarget('/dashboard/tickets?tab=2');
    } catch (err) {
      console.error('Error accepting transfer:', err);
      setSnackbar({
        open: true,
        message: 'Failed to accept transfer',
        severity: 'error',
      });
      setAcceptingTransfer(false);
    }
  };

  // Handler for rejecting transfer
  const handleRejectTransfer = async () => {
    if (!ticket) return;

    setRejectingTransfer(true);
    try {
      const result = await manageTransferTicket(ticketId, false);
      console.log('Transfer rejected result:', result);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Transfer request rejected',
        severity: 'success',
      });

      // Reset navigation state and set new target
      setNavigationAttempted(false);
      setNavigationTarget('/dashboard/tickets?tab=2');
    } catch (err) {
      console.error('Error rejecting transfer:', err);
      setSnackbar({
        open: true,
        message: 'Failed to reject transfer',
        severity: 'error',
      });
      setRejectingTransfer(false);
    }
  };

  // Handler for assigning ticket
  const handleAssignTicket = async () => {
    if (!ticket) return;

    setAssigningTicket(true);
    try {
      console.log('Attempting to assign ticket with ID:', ticketId);
      const response = await assignTicket(ticketId);
      console.log('Ticket assignment response:', response);

      if (response && response.statusCodes === 200) {
        // Store the current user's ID as handledBy in localStorage
        // This helps ensure consistency when the page refreshes
        if (typeof window !== 'undefined' && response.response?.data?.handledBy) {
          localStorage.setItem(`ticket_${ticketId}_handledBy`, response.response.data.handledBy);
        }

        setSnackbar({
          open: true,
          message: 'Ticket assigned successfully',
          severity: 'success',
        });

        // Update ticket data locally to reflect the change
        if (response.response?.data) {
          setTicket(response.response.data);
        }
      } else {
        throw new Error('Failed to assign ticket');
      }
    } catch (err: any) {
      console.error('Error assigning ticket:', err);
      setSnackbar({
        open: true,
        message: 'Failed to assign ticket. Please try again.',
        severity: 'error',
      });
    } finally {
      setAssigningTicket(false);
    }
  };

  // Load staff when role changes
  const fetchStaff = async (role: string) => {
    setLoadingStaff(true);
    try {
      const result = await getStaffs(role);
      if (result.statusCodes === 200 && result.response?.data) {
        setStaffList(result.response.data);
        if (result.response.data.length > 0) {
          setSelectedStaffId(result.response.data[0].id);
        } else {
          setSelectedStaffId('');
        }
      } else {
        setStaffList([]);
        setSelectedStaffId('');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
      setSelectedStaffId('');
      setSnackbar({
        open: true,
        message: 'Failed to load staff list',
        severity: 'error',
      });
    } finally {
      setLoadingStaff(false);
    }
  };

  // Handle role change
  const handleRoleChange = (event: SelectChangeEvent) => {
    const role = event.target.value;
    setSelectedRole(role);
    fetchStaff(role);
  };

  // Handle staff selection change
  const handleStaffChange = (event: SelectChangeEvent) => {
    setSelectedStaffId(event.target.value);
  };

  // Open transfer dialog
  const handleOpenTransferDialog = () => {
    setTransferDialogOpen(true);
    fetchStaff(selectedRole);
  };

  // Close transfer dialog
  const handleCloseTransferDialog = () => {
    setTransferDialogOpen(false);
  };

  // Submit transfer request
  const handleSubmitTransfer = async () => {
    if (!selectedStaffId) {
      setSnackbar({
        open: true,
        message: 'Please select a staff member',
        severity: 'error',
      });
      return;
    }

    setTransferring(true);
    try {
      const result = await transferTicket(ticketId, selectedStaffId);
      console.log('Transfer result:', result);

      if (result.statusCodes === 200) {
        setSnackbar({
          open: true,
          message: 'Ticket transferred successfully',
          severity: 'success',
        });

        // Refresh ticket data
        const data = await getTicketById(ticketId);
        if (data && data.statusCodes === 200 && data.response?.data) {
          setTicket(data.response.data);
        }

        setTransferDialogOpen(false);
      }
    } catch (error) {
      console.error('Error transferring ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to transfer ticket',
        severity: 'error',
      });
    } finally {
      setTransferring(false);
    }
  };

  // Function to handle status change
  const handleChangeStatus = async () => {
    if (!ticket || !selectedStatus) return;

    setUpdatingStatus(true);
    try {
      const result = await changeTicketStatus(ticketId, selectedStatus);
      console.log('Status change result:', result);

      // Close dialog and show success message
      setStatusDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Ticket status changed to ${selectedStatus}`,
        severity: 'success',
      });

      // Reset navigation state and set new target
      setNavigationAttempted(false);
      setNavigationTarget('/dashboard/tickets?tab=1');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update ticket status',
        severity: 'error',
      });
      setUpdatingStatus(false);
    }
  };

  // Open status change dialog
  const handleOpenStatusDialog = () => {
    setSelectedStatus('');
    setStatusDialogOpen(true);
  };

  // Close status change dialog
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  // Handle status selection change
  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value as TicketStatus);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading ticket: {error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          color="inherit"
          startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
          onClick={() => router.push(getBackPath())}
        >
          Back to Tickets
        </Button>
        <Typography variant="h4">Ticket Details</Typography>
      </Stack>

      {ticket && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Ticket ID: {ticket.id.slice(0, 8)}...</Typography>
                <Chip label={ticket.status} color={getStatusColor(ticket.status)} />
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body1">{ticket.userFullName}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">{new Date(ticket.createdAt).toLocaleDateString()}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">{ticket.type}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Handled By
              </Typography>
              <Typography variant="body1">{ticket.handledBy || storedHandledBy || '-'}</Typography>
            </Grid>

            {(ticket.description || ticket.briefDescription) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Card variant="outlined" sx={{ mt: 1 }}>
                  <CardContent>
                    <Typography variant="body1">{ticket.description || ticket.briefDescription}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {ticket.attachments && ticket.attachments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Attachments
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {ticket.attachments.map((attachment, index) => {
                      const fileName = getFileName(attachment);
                      const isImage = isImageFile(attachment);

                      return (
                        <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                          <Card variant="outlined">
                            {isImage ? (
                              <Box component="a" href={attachment} target="_blank" sx={{ textDecoration: 'none' }}>
                                <Box
                                  component="img"
                                  src={attachment}
                                  alt={fileName}
                                  sx={{
                                    width: '100%',
                                    height: 140,
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Typography
                                    variant="body2"
                                    color="primary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {fileName || `Image ${index + 1}`}
                                  </Typography>
                                </CardContent>
                              </Box>
                            ) : (
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box
                                  component="a"
                                  href={attachment}
                                  target="_blank"
                                  sx={{
                                    textDecoration: 'none',
                                    display: 'block',
                                    '&:hover': { textDecoration: 'underline' },
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {getFileIcon(attachment)}
                                    <Typography
                                      variant="body2"
                                      color="primary"
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {fileName || `Attachment ${index + 1}`}
                                    </Typography>
                                  </Stack>
                                </Box>
                              </CardContent>
                            )}
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Ticket Responses Section */}
            {ticket.ticketResponses && ticket.ticketResponses.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Responses
                </Typography>
                <Stack spacing={2}>
                  {ticket.ticketResponses.map((response, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">{response.userFullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(response.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{response.message}</Typography>

                        {response.attachments && response.attachments.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              Attachments:
                            </Typography>
                            <Grid container spacing={2}>
                              {response.attachments.map((attachment: string, attachIndex: number) => {
                                const fileName = getFileName(attachment);
                                const isImage = isImageFile(attachment);

                                return (
                                  <Grid item key={attachIndex} xs={12} sm={6} md={4} lg={3}>
                                    <Card variant="outlined">
                                      {isImage ? (
                                        <Box
                                          component="a"
                                          href={attachment}
                                          target="_blank"
                                          sx={{ textDecoration: 'none' }}
                                        >
                                          <Box
                                            component="img"
                                            src={attachment}
                                            alt={fileName}
                                            sx={{
                                              width: '100%',
                                              height: 140,
                                              objectFit: 'cover',
                                              display: 'block',
                                            }}
                                          />
                                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography
                                              variant="body2"
                                              color="primary"
                                              sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {fileName || `Image ${attachIndex + 1}`}
                                            </Typography>
                                          </CardContent>
                                        </Box>
                                      ) : (
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                          <Box
                                            component="a"
                                            href={attachment}
                                            target="_blank"
                                            sx={{
                                              textDecoration: 'none',
                                              display: 'block',
                                              '&:hover': { textDecoration: 'underline' },
                                            }}
                                          >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              {getFileIcon(attachment)}
                                              <Typography
                                                variant="body2"
                                                color="primary"
                                                sx={{
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                                }}
                                              >
                                                {fileName || `Attachment ${attachIndex + 1}`}
                                              </Typography>
                                            </Stack>
                                          </Box>
                                        </CardContent>
                                      )}
                                    </Card>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            )}

            {/* Response Form (only for assigned/transfer tickets and when status allows) */}
            {(isAssignedTicket || isTransferRequest) && canRespond && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                  Add Response
                </Typography>
                <Box component="form" onSubmit={handleSubmitResponse}>
                  <TextField
                    label="Your response"
                    multiline
                    rows={4}
                    value={responseMessage}
                    onChange={handleResponseChange}
                    fullWidth
                    variant="outlined"
                    placeholder="Type your response here..."
                    disabled={submitting}
                  />

                  {responseAttachments.length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                        Attachments:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {responseAttachments.map((file, index) => (
                          <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => handleRemoveAttachment(index)}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" onClick={handleAddAttachment} disabled={submitting}>
                      Add Attachment
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <PaperPlaneRight />}
                    >
                      {submitting ? 'Submitting...' : 'Send Response'}
                    </Button>
                  </Box>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Grid>
            )}

            {/* Action buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                {/* Status Change button - Show for tickets that are not Closed or Done, primarily in Assigned Tickets tab */}
                {(isAssignedTicket || (isAllTickets && ticket.handledBy)) &&
                  ticket.status !== TicketStatus.Closed &&
                  ticket.status !== TicketStatus.Done && (
                    <Button
                      variant="contained"
                      color="info"
                      onClick={handleOpenStatusDialog}
                      disabled={submitting || assigningTicket}
                    >
                      Change Status
                    </Button>
                  )}

                {/* Accept/Reject buttons - Show in Transfer Requests tab for any state */}
                {isTransferRequest && (
                  <ButtonGroup variant="contained">
                    <Button
                      color="success"
                      startIcon={acceptingTransfer ? <CircularProgress size={20} /> : <CheckCircle />}
                      onClick={handleAcceptTransfer}
                      disabled={acceptingTransfer || rejectingTransfer}
                    >
                      {acceptingTransfer ? 'Accepting...' : 'Accept'}
                    </Button>
                    <Button
                      color="error"
                      startIcon={rejectingTransfer ? <CircularProgress size={20} /> : <XCircle />}
                      onClick={handleRejectTransfer}
                      disabled={acceptingTransfer || rejectingTransfer}
                    >
                      {rejectingTransfer ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </ButtonGroup>
                )}

                {/* Transfer button - Only show in Assigned Tickets tab */}
                {isAssignedTicket && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleOpenTransferDialog}
                    startIcon={<ArrowsClockwise />}
                    disabled={submitting}
                  >
                    Transfer
                  </Button>
                )}

                {/* Assign button - Only show in All Tickets tab and for unassigned tickets */}
                {isAllTickets && !ticket.handledBy && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAssignTicket}
                    startIcon={assigningTicket ? <CircularProgress size={20} /> : <UserCirclePlus />}
                    disabled={assigningTicket}
                  >
                    {assigningTicket ? 'Assigning...' : 'Assign'}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Transfer dialog */}
      <Dialog open={transferDialogOpen} onClose={handleCloseTransferDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Ticket</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Select a staff member to transfer this ticket to.</DialogContentText>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Role"
              onChange={handleRoleChange}
              disabled={loadingStaff || transferring}
            >
              <MenuItem value="Consultant">Consultant</MenuItem>
              <MenuItem value="Technician">Technician</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="staff-select-label">Staff Member</InputLabel>
            <Select
              labelId="staff-select-label"
              id="staff-select"
              value={selectedStaffId}
              label="Staff Member"
              onChange={handleStaffChange}
              disabled={loadingStaff || transferring || staffList.length === 0}
            >
              {loadingStaff ? (
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </Box>
                </MenuItem>
              ) : staffList.length > 0 ? (
                staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name} ({staff.email})
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No staff members found</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog} disabled={transferring}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitTransfer}
            color="primary"
            disabled={transferring || !selectedStaffId || loadingStaff}
            startIcon={transferring ? <CircularProgress size={20} /> : null}
          >
            {transferring ? 'Transferring...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Change Ticket Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Select a new status for this ticket.</DialogContentText>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={selectedStatus}
              label="Status"
              onChange={handleStatusChange}
              disabled={updatingStatus}
            >
              <MenuItem value={TicketStatus.Done}>Done</MenuItem>
              <MenuItem value={TicketStatus.Closed}>Closed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={updatingStatus}>
            Cancel
          </Button>
          <Button
            onClick={handleChangeStatus}
            color="primary"
            disabled={updatingStatus || !selectedStatus}
            startIcon={updatingStatus ? <CircularProgress size={20} /> : null}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Stack>
  );
}

export default TicketDetail;
