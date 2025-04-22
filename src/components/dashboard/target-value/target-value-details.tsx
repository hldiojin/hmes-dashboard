'use client';

import * as React from 'react';
import targetValueService, { PlantSummary, TargetValueWithPlants } from '@/services/targetValueService';
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Plus, Trash, X } from '@phosphor-icons/react';

import { ValueType, ValueTypeEnums } from '@/types/targetValue';

interface TargetValueDetailsProps {
  open: boolean;
  onClose: () => void;
  targetValueId: string;
}

function TargetValueDetails({ open, onClose, targetValueId }: TargetValueDetailsProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [targetDetails, setTargetDetails] = React.useState<TargetValueWithPlants | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // State for add plant functionality
  const [addPlantDialogOpen, setAddPlantDialogOpen] = React.useState(false);
  const [availablePlants, setAvailablePlants] = React.useState<PlantSummary[]>([]);
  const [selectedPlantId, setSelectedPlantId] = React.useState<string>('');
  const [loadingAvailablePlants, setLoadingAvailablePlants] = React.useState(false);
  const [assigningPlant, setAssigningPlant] = React.useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // State for remove confirmation
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [plantToRemove, setPlantToRemove] = React.useState<PlantSummary | null>(null);
  const [removingPlant, setRemovingPlant] = React.useState(false);

  // Fetch target value details when component mounts or targetValueId changes
  React.useEffect(() => {
    if (open && targetValueId) {
      fetchTargetDetails();
    }
  }, [open, targetValueId]);

  const fetchTargetDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await targetValueService.getTargetValueDetails(targetValueId);
      setTargetDetails(response.response.data);
    } catch (error) {
      console.error('Failed to fetch target value details:', error);
      setError('Không thể tải chi tiết giá trị mục tiêu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Open the add plant dialog
  const handleOpenAddPlantDialog = async () => {
    if (!targetDetails) return;

    setLoadingAvailablePlants(true);
    try {
      const plants = await targetValueService.getPlantsWithoutTargetValueType(targetDetails.type);
      setAvailablePlants(plants);
      setAddPlantDialogOpen(true);
    } catch (error) {
      console.error('Failed to load available plants:', error);
    } finally {
      setLoadingAvailablePlants(false);
    }
  };

  // Close the add plant dialog
  const handleCloseAddPlantDialog = () => {
    setAddPlantDialogOpen(false);
    setSelectedPlantId('');
  };

  // Handle plant selection
  const handlePlantChange = (event: SelectChangeEvent<string>) => {
    setSelectedPlantId(event.target.value);
  };

  // Assign the selected plant to this target value
  const handleAssignPlant = async () => {
    if (!selectedPlantId || !targetValueId) return;

    setAssigningPlant(true);
    try {
      await targetValueService.setValueForPlant(selectedPlantId, targetValueId);

      // Close the dialog and refresh the details
      handleCloseAddPlantDialog();
      await fetchTargetDetails();

      // Show success message
      setSnackbar({
        open: true,
        message: 'Đã gán cây trồng vào giá trị mục tiêu thành công',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Failed to assign plant to target value:', error);

      // Extract error message from response if available
      let errorMessage = 'Không thể gán cây trồng vào giá trị mục tiêu';
      if (error.response?.data?.response?.message) {
        errorMessage = error.response.data.response.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setAssigningPlant(false);
    }
  };

  // Get target type display name
  const getTargetTypeDisplayName = (type: string): string => {
    switch (type) {
      case 'SoluteConcentration':
        return 'Nồng độ dung dịch';
      case 'Ph':
        return 'pH';
      case 'WaterLevel':
        return 'Mực nước';
      case 'Temperature':
        return 'Nhiệt độ';
      default:
        return type;
    }
  };

  // Get target type unit
  const getTargetTypeUnit = (type: string): string => {
    switch (type) {
      case 'Temperature':
        return '°C';
      case 'SoluteConcentration':
        return 'ppm';
      case 'WaterLevel':
        return 'cm';
      case 'Ph':
        return '';
      default:
        return '';
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle remove plant button click
  const handleRemoveClick = (plant: PlantSummary, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPlantToRemove(plant);
    setRemoveDialogOpen(true);
  };

  // Handle remove dialog close
  const handleCloseRemoveDialog = () => {
    setRemoveDialogOpen(false);
    setPlantToRemove(null);
  };

  // Handle remove confirmation
  const handleConfirmRemove = async () => {
    if (!plantToRemove || !targetValueId) return;

    setRemovingPlant(true);
    try {
      await targetValueService.removeValueFromPlant(plantToRemove.id, targetValueId);

      // Close dialog and refresh details
      setRemoveDialogOpen(false);
      setPlantToRemove(null);
      await fetchTargetDetails();

      // Show success message
      setSnackbar({
        open: true,
        message: `Đã xóa giá trị mục tiêu khỏi cây trồng "${plantToRemove.name}" thành công`,
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Failed to remove target value from plant:', error);

      // Extract error message if available
      let errorMessage = 'Không thể xóa giá trị mục tiêu khỏi cây trồng';
      if (error.response?.data?.response?.message) {
        errorMessage = error.response.data.response.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setRemovingPlant(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chi tiết giá trị mục tiêu</Typography>
            <IconButton onClick={onClose} size="small">
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3}>
              <Typography color="error">{error}</Typography>
              <Button variant="contained" onClick={fetchTargetDetails} sx={{ mt: 2 }}>
                Thử lại
              </Button>
            </Box>
          ) : targetDetails ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <Typography variant="h5">{getTargetTypeDisplayName(targetDetails.type)}</Typography>
                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Giá trị tối thiểu
                        </Typography>
                        <Typography variant="h6">
                          {targetDetails.minValue} {getTargetTypeUnit(targetDetails.type)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Giá trị tối đa
                        </Typography>
                        <Typography variant="h6">
                          {targetDetails.maxValue} {getTargetTypeUnit(targetDetails.type)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">
                      Cây trồng sử dụng giá trị mục tiêu này ({targetDetails.plants.length})
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Plus size={20} />}
                      onClick={handleOpenAddPlantDialog}
                      disabled={loadingAvailablePlants}
                    >
                      {loadingAvailablePlants ? 'Đang tải...' : 'Thêm cây trồng'}
                    </Button>
                  </Stack>
                  {targetDetails.plants.length === 0 ? (
                    <Typography color="text.secondary">Chưa có cây trồng nào sử dụng giá trị mục tiêu này.</Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {targetDetails.plants.map((plant) => (
                            <TableRow key={plant.id} hover>
                              <TableCell>
                                <Typography variant="body2">{plant.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={plant.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                                  color={plant.status === 'Active' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Xóa khỏi giá trị mục tiêu này" arrow>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={(event) => handleRemoveClick(plant, event)}
                                  >
                                    <Trash size={20} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Add Plant Dialog */}
      <Dialog open={addPlantDialogOpen} onClose={handleCloseAddPlantDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm cây trồng vào giá trị mục tiêu này</DialogTitle>
        <DialogContent>
          {availablePlants.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Không tìm thấy cây trồng khả dụng. Tất cả cây trồng đã có giá trị mục tiêu {targetDetails?.type} được thiết lập.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Chọn cây trồng</InputLabel>
                <Select value={selectedPlantId} onChange={handlePlantChange} label="Chọn cây trồng">
                  {availablePlants.map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.name} - {plant.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddPlantDialog}>Hủy</Button>
          <Button onClick={handleAssignPlant} variant="contained" disabled={!selectedPlantId || assigningPlant}>
            {assigningPlant ? 'Đang gán...' : 'Gán'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={handleCloseRemoveDialog}
        aria-labelledby="remove-dialog-title"
        aria-describedby="remove-dialog-description"
      >
        <DialogTitle id="remove-dialog-title">Xóa giá trị mục tiêu khỏi cây trồng</DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-dialog-description">
            Bạn có chắc chắn muốn xóa giá trị mục tiêu này khỏi cây trồng "{plantToRemove?.name}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} disabled={removingPlant}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            disabled={removingPlant}
            startIcon={removingPlant ? <CircularProgress size={20} /> : null}
          >
            {removingPlant ? 'Đang xóa...' : 'Xóa'}
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
}

export default TargetValueDetails;
