'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  assignTicket,
  changeTicketStatus,
  getDeviceById,
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

import { DeviceItem, Staff, StaffListResponse, Ticket, TicketResponse, TicketStatus, TicketType } from '@/types/ticket';

// Helper function to format dates in DD-MM-YYYY format
const formatDate = (dateString: string): string => {
  try {
    console.log('Formatting date from:', dateString);
    const date = new Date(dateString);
    // Format to DD-MM-YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}-${month}-${year}`;
    console.log('Formatted date result:', formatted);
    return formatted;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Helper function to format date and time (without seconds)
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format to DD-MM-YYYY HH:MM
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateString;
  }
};

// Helper function to format date and time including seconds
const formatDateTimeWithSeconds = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format to DD-MM-YYYY HH:MM:SS
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date and time with seconds:', error);
    return dateString;
  }
};

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

  // Add device state
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceItem | null>(null);
  const [loadingDevice, setLoadingDevice] = React.useState(false);

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

          // If it's a technical ticket and has deviceItemId, fetch device info
          if (data.response.data.type === TicketType.Technical && data.response.data.deviceItemId) {
            fetchDeviceInfo(data.response.data.deviceItemId);
          }
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

    // Function to fetch device info
    const fetchDeviceInfo = async (deviceId: string) => {
      setLoadingDevice(true);
      try {
        console.log('Fetching device info with ID:', deviceId);
        const result = await getDeviceById(deviceId);
        console.log('Device info response:', result);

        if (result && result.statusCodes === 200 && result.response?.data) {
          // Log the warranty date for debugging
          console.log('Warranty expiry date (raw):', result.response.data.warrantyExpiryDate);
          console.log('Warranty expiry date (formatted):', formatDate(result.response.data.warrantyExpiryDate));

          setDeviceInfo(result.response.data);
        }
      } catch (err) {
        console.error('Error fetching device info:', err);
        // Don't set an error, just log it - the ticket still loads
      } finally {
        setLoadingDevice(false);
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
        message: 'Vui lòng nhập nội dung phản hồi',
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
          message: 'Phản hồi đã được gửi thành công',
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setSnackbar({
        open: true,
        message: 'Gửi phản hồi thất bại',
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
        message: 'Đã chấp nhận yêu cầu chuyển ticket',
        severity: 'success',
      });

      // Reset navigation state and set new target
      setNavigationAttempted(false);
      setNavigationTarget('/dashboard/tickets?tab=2');
    } catch (err) {
      console.error('Error accepting transfer:', err);
      setSnackbar({
        open: true,
        message: 'Chấp nhận yêu cầu chuyển ticket thất bại',
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
        message: 'Đã từ chối yêu cầu chuyển ticket',
        severity: 'success',
      });

      // Reset navigation state and set new target
      setNavigationAttempted(false);
      setNavigationTarget('/dashboard/tickets?tab=2');
    } catch (err) {
      console.error('Error rejecting transfer:', err);
      setSnackbar({
        open: true,
        message: 'Từ chối yêu cầu chuyển ticket thất bại',
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
          message: 'Đã nhận ticket thành công',
          severity: 'success',
        });

        // Update ticket data locally to reflect the change
        if (response.response?.data) {
          setTicket(response.response.data);
        }
        setNavigationAttempted(false);
        setNavigationTarget('/dashboard/tickets?tab=1');
      } else {
        throw new Error('Failed to assign ticket');
      }
    } catch (err: any) {
      console.error('Error assigning ticket:', err);
      setSnackbar({
        open: true,
        message: 'Gán ticket thất bại. Vui lòng thử lại sau.',
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
        message: 'Không thể tải danh sách nhân viên',
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
        message: 'Vui lòng chọn nhân viên',
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
          message: 'Đã chuyển ticket thành công',
          severity: 'success',
        });

        // Refresh ticket data
        const data = await getTicketById(ticketId);
        if (data && data.statusCodes === 200 && data.response?.data) {
          setTicket(data.response.data);
        }

        setTransferDialogOpen(false);
        setNavigationTarget('/dashboard/tickets?tab=1');
      }
    } catch (error) {
      console.error('Error transferring ticket:', error);
      setSnackbar({
        open: true,
        message: 'Chuyển ticket thất bại',
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
        message: `Đã thay đổi trạng thái ticket thành ${translateStatus(selectedStatus)}`,
        severity: 'success',
      });

      // Reset navigation state and set new target
      setNavigationAttempted(false);
      setNavigationTarget('/dashboard/tickets?tab=1');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái ticket thất bại',
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

  // Update the formatWarrantyDate function to use the new format with time
  const formatWarrantyDate = (dateString: string): string => {
    return formatDateTimeWithSeconds(dateString);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải thông tin ticket...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Lỗi khi tải thông tin ticket: {error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          color="inherit"
          startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
          onClick={() => router.push(getBackPath())}
        >
          Quay lại danh sách
        </Button>
        <Typography variant="h4">Chi tiết ticket</Typography>
      </Stack>

      {ticket && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Mã ticket: {ticket.id.slice(0, 8)}...</Typography>
                <Chip label={translateStatus(ticket.status)} color={getStatusColor(ticket.status)} />
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Người tạo
              </Typography>
              <Typography variant="body1">{ticket.userFullName}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Ngày tạo
              </Typography>
              <Typography variant="body1">{formatDate(ticket.createdAt)}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Loại
              </Typography>
              <Typography variant="body1">{translateType(ticket.type)}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Người xử lý
              </Typography>
              <Typography variant="body1">{ticket.handledBy || storedHandledBy || '-'}</Typography>
            </Grid>

            {/* Add Device Information for Technical tickets */}
            {ticket.type === TicketType.Technical && (
              <>
                {ticket.deviceItemId && ticket.deviceItemSerial && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mã thiết bị
                    </Typography>
                    <Typography variant="body1">{ticket.deviceItemSerial}</Typography>
                  </Grid>
                )}

                {loadingDevice ? (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thông tin thiết bị
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2">Đang tải...</Typography>
                    </Box>
                  </Grid>
                ) : deviceInfo ? (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hạn bảo hành
                    </Typography>
                    <Typography variant="body1">{formatWarrantyDate(deviceInfo.warrantyExpiryDate)}</Typography>
                  </Grid>
                ) : null}
              </>
            )}

            {(ticket.description || ticket.briefDescription) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mô tả
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
                  Tệp đính kèm
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
                                    {fileName || `Hình ảnh ${index + 1}`}
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
                                      {fileName || `Tệp đính kèm ${index + 1}`}
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
                  Phản hồi
                </Typography>
                <Stack spacing={2}>
                  {ticket.ticketResponses.map((response, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">{response.userFullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(response.createdAt)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{response.message}</Typography>

                        {response.attachments && response.attachments.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              Tệp đính kèm:
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
                                              {fileName || `Hình ảnh ${attachIndex + 1}`}
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
                                                {fileName || `Tệp đính kèm ${attachIndex + 1}`}
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
                  Thêm phản hồi
                </Typography>
                <Box component="form" onSubmit={handleSubmitResponse}>
                  <TextField
                    label="Nội dung phản hồi"
                    multiline
                    rows={4}
                    value={responseMessage}
                    onChange={handleResponseChange}
                    fullWidth
                    variant="outlined"
                    placeholder="Nhập phản hồi của bạn tại đây..."
                    disabled={submitting}
                  />

                  {responseAttachments.length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                        Tệp đính kèm:
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
                      Thêm tệp đính kèm
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <PaperPlaneRight />}
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
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
                  ticket.status !== TicketStatus.Done &&
                  ticket.status !== TicketStatus.IsTransferring && (
                    <Button
                      variant="contained"
                      color="info"
                      onClick={handleOpenStatusDialog}
                      disabled={submitting || assigningTicket}
                    >
                      Thay đổi trạng thái
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
                      {acceptingTransfer ? 'Đang xử lý...' : 'Chấp nhận'}
                    </Button>
                    <Button
                      color="error"
                      startIcon={rejectingTransfer ? <CircularProgress size={20} /> : <XCircle />}
                      onClick={handleRejectTransfer}
                      disabled={acceptingTransfer || rejectingTransfer}
                    >
                      {rejectingTransfer ? 'Đang xử lý...' : 'Từ chối'}
                    </Button>
                  </ButtonGroup>
                )}

                {/* Transfer button - Only show in Assigned Tickets tab */}
                {isAssignedTicket && ticket.status !== TicketStatus.IsTransferring && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleOpenTransferDialog}
                    startIcon={<ArrowsClockwise />}
                    disabled={submitting}
                  >
                    Chuyển ticket
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
                    {assigningTicket ? 'Đang nhận...' : 'Đảm nhận'}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Transfer dialog */}
      <Dialog open={transferDialogOpen} onClose={handleCloseTransferDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chuyển ticket</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Chọn vai trò và nhân viên để chuyển ticket này</DialogContentText>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Vai trò</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Vai trò"
              onChange={handleRoleChange}
              disabled={loadingStaff || transferring}
            >
              <MenuItem value="Consultant">Tư vấn viên</MenuItem>
              <MenuItem value="Technician">Kỹ thuật viên</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="staff-select-label">Nhân viên</InputLabel>
            <Select
              labelId="staff-select-label"
              id="staff-select"
              value={selectedStaffId}
              label="Nhân viên"
              onChange={handleStaffChange}
              disabled={loadingStaff || transferring || staffList.length === 0}
            >
              {loadingStaff ? (
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Đang tải...
                  </Box>
                </MenuItem>
              ) : staffList.length > 0 ? (
                staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name} ({staff.email})
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">Không tìm thấy nhân viên</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog} disabled={transferring}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmitTransfer}
            color="primary"
            disabled={transferring || !selectedStaffId || loadingStaff}
            startIcon={transferring ? <CircularProgress size={20} /> : null}
          >
            {transferring ? 'Đang chuyển...' : 'Chuyển'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thay đổi trạng thái ticket</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Chọn trạng thái mới cho ticket này</DialogContentText>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Trạng thái</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={selectedStatus}
              label="Trạng thái"
              onChange={handleStatusChange}
              disabled={updatingStatus}
            >
              <MenuItem value={TicketStatus.Pending}>Đang chờ</MenuItem>
              <MenuItem value={TicketStatus.InProgress}>Đang xử lý</MenuItem>
              <MenuItem value={TicketStatus.Done}>Hoàn thành</MenuItem>
              <MenuItem value={TicketStatus.Closed}>Đã đóng</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={updatingStatus}>
            Hủy
          </Button>
          <Button
            onClick={handleChangeStatus}
            color="primary"
            disabled={updatingStatus || !selectedStatus}
            startIcon={updatingStatus ? <CircularProgress size={20} /> : null}
          >
            {updatingStatus ? 'Đang cập nhật...' : 'Cập nhật'}
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
