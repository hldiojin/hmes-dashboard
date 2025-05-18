import React, { useEffect, useState } from 'react';
import phaseService, { Phase } from '@/services/phaseService';
import { Add as AddIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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

    try {
      await phaseService.createPhase(newPhaseName);
      showSnackbar('Tạo giai đoạn thành công', 'success');
      setNewPhaseName('');
      setIsAddDialogOpen(false);
      fetchPhases();
    } catch (error: any) {
      console.error('Error creating phase:', error);
      showSnackbar(error.response?.data?.message || 'Không thể tạo giai đoạn', 'error');
    }
  };

  const handleEditPhase = async () => {
    if (!selectedPhase || !newPhaseName.trim()) {
      showSnackbar('Tên giai đoạn không được để trống', 'error');
      return;
    }

    try {
      await phaseService.updatePhase(selectedPhase.id, newPhaseName);
      showSnackbar('Cập nhật giai đoạn thành công', 'success');
      setNewPhaseName('');
      setIsEditDialogOpen(false);
      setSelectedPhase(null);
      fetchPhases();
    } catch (error: any) {
      console.error('Error updating phase:', error);
      showSnackbar(error.response?.data?.message || 'Không thể cập nhật giai đoạn', 'error');
    }
  };

  const openEditDialog = (phase: Phase) => {
    setSelectedPhase(phase);
    setNewPhaseName(phase.name);
    setIsEditDialogOpen(true);
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
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phases.map((phase) => (
                  <TableRow key={phase.id}>
                    <TableCell>{phase.name}</TableCell>
                    <TableCell>{phase.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEditDialog(phase)}>
                        <EditIcon />
                      </IconButton>
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
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
          <DialogTitle>Thêm giai đoạn mới</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tên giai đoạn"
              fullWidth
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddPhase} variant="contained" color="primary">
              Thêm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Phase Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
          <DialogTitle>Chỉnh sửa giai đoạn</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tên giai đoạn"
              fullWidth
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditPhase} variant="contained" color="primary">
              Lưu
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
