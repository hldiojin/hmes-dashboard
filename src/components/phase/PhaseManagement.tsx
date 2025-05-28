import React, { useEffect, useState } from 'react';
import phaseService, { Phase } from '@/services/phaseService';
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

interface PhaseManagementProps {
  open: boolean;
  onClose: () => void;
}

const PhaseManagement: React.FC<PhaseManagementProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const fetchPhases = async () => {
    setLoading(true);
    try {
      const response = await phaseService.getAllPhases();
      setPhases(response.response.data);
    } catch (error) {
      console.error('Error fetching phases:', error);
      showSnackbar('Không thể tải danh sách giai đoạn', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPhases();
    }
  }, [open]);

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) {
      showSnackbar('Tên giai đoạn không được để trống', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await phaseService.createPhase(newPhaseName);
      showSnackbar('Tạo giai đoạn thành công', 'success');
      setNewPhaseName('');
      setIsAddDialogOpen(false);
      fetchPhases();
    } catch (error: any) {
      console.error('Error creating phase:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo giai đoạn';

      // Handle specific error messages
      let displayMessage = errorMessage;
      switch (errorMessage) {
        case 'Phase with the same name already exists':
          displayMessage = 'Giai đoạn với tên này đã tồn tại';
          break;
      }

      showSnackbar(displayMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPhase = async () => {
    if (!selectedPhase || !newPhaseName.trim()) {
      showSnackbar('Tên giai đoạn không được để trống', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await phaseService.updatePhase(selectedPhase.id, newPhaseName);
      showSnackbar('Cập nhật giai đoạn thành công', 'success');
      setNewPhaseName('');
      setIsEditDialogOpen(false);
      setSelectedPhase(null);
      fetchPhases();
    } catch (error: any) {
      console.error('Error updating phase:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật giai đoạn';

      // Handle specific error messages
      let displayMessage = errorMessage;
      switch (errorMessage) {
        case 'Phase not found':
          displayMessage = 'Không tìm thấy giai đoạn';
          break;
        case 'Phase with the same name already exists':
          displayMessage = 'Giai đoạn với tên này đã tồn tại';
          break;
      }

      showSnackbar(displayMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePhase = async () => {
    if (!selectedPhase) return;

    setIsProcessing(true);
    try {
      await phaseService.deletePhase(selectedPhase.id);
      showSnackbar('Xóa giai đoạn thành công', 'success');
      setIsDeleteDialogOpen(false);
      setSelectedPhase(null);
      fetchPhases();
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      const errorMessage = error.response?.data?.message || 'Không thể xóa giai đoạn';

      // Handle specific error messages
      let displayMessage = errorMessage;
      switch (errorMessage) {
        case 'Phase not found':
          displayMessage = 'Không tìm thấy giai đoạn';
          break;
        case 'Cannot delete default phase':
          displayMessage = 'Không thể xóa giai đoạn mặc định';
          break;
        case 'Cannot delete because there are device items using this phase':
          displayMessage = 'Không thể xóa vì có thiết bị đang sử dụng giai đoạn này';
          break;
      }

      showSnackbar(displayMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (phase: Phase) => {
    setIsProcessing(true);
    try {
      await phaseService.updatePhaseStatus(phase.id);
      showSnackbar('Cập nhật trạng thái thành công', 'success');
      fetchPhases();
    } catch (error: any) {
      console.error('Error updating phase status:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái';

      // Handle specific error messages
      let displayMessage = errorMessage;
      switch (errorMessage) {
        case 'Phase not found':
          displayMessage = 'Không tìm thấy giai đoạn';
          break;
        case 'Cannot update status of default phase':
          displayMessage = 'Không thể cập nhật trạng thái của giai đoạn mặc định';
          break;
      }

      showSnackbar(displayMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditDialog = (phase: Phase) => {
    setSelectedPhase(phase);
    setNewPhaseName(phase.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Quản lý giai đoạn cây trồng</Typography>
          <IconButton aria-label="close" onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              color="primary"
            >
              Thêm giai đoạn mới
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phases.map((phase) => (
                  <TableRow key={phase.id}>
                    <TableCell>{phase.name}</TableCell>
                    <TableCell>
                      {phase.isDefault ? (
                        <Chip
                          label="Mặc định"
                          color="primary"
                          size="small"
                          sx={{ backgroundColor: theme.palette.info.main }}
                        />
                      ) : (
                        <Chip label="Tùy chỉnh" variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Nhấn để thay đổi trạng thái">
                        <Switch
                          checked={phase.status === 'Active'}
                          onChange={() => handleUpdateStatus(phase)}
                          disabled={isProcessing}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEditDialog(phase)}
                            disabled={isProcessing}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(phase)}
                            disabled={isProcessing}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {phases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Không tìm thấy giai đoạn nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        {/* Add Phase Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => !isProcessing && setIsAddDialogOpen(false)}>
          <DialogTitle>Thêm giai đoạn mới</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tên giai đoạn"
              fullWidth
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              disabled={isProcessing}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)} disabled={isProcessing}>
              Hủy
            </Button>
            <Button
              onClick={handleAddPhase}
              variant="contained"
              color="primary"
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            >
              {isProcessing ? 'Đang xử lý...' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Phase Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => !isProcessing && setIsEditDialogOpen(false)}>
          <DialogTitle>Chỉnh sửa giai đoạn</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tên giai đoạn"
              fullWidth
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              disabled={isProcessing}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)} disabled={isProcessing}>
              Hủy
            </Button>
            <Button
              onClick={handleEditPhase}
              variant="contained"
              color="primary"
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            >
              {isProcessing ? 'Đang xử lý...' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => !isProcessing && setIsDeleteDialogOpen(false)}>
          <DialogTitle>Xác nhận xóa giai đoạn</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn xóa giai đoạn "{selectedPhase?.name}"? Hành động này không thể hoàn tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
              Hủy
            </Button>
            <Button
              onClick={handleDeletePhase}
              color="error"
              variant="contained"
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            >
              {isProcessing ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PhaseManagement;
