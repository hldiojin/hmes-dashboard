'use client';

import * as React from 'react';
import phaseService, { Phase } from '@/services/phaseService';
import targetValueService, { PlantWithPhase, TargetValueWithPlants } from '@/services/targetValueService';
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

import { Plant } from '@/types/plant';
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
  const [availablePlants, setAvailablePlants] = React.useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = React.useState<string>('');
  const [loadingAvailablePlants, setLoadingAvailablePlants] = React.useState(false);
  const [assigningPlant, setAssigningPlant] = React.useState(false);
  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = React.useState<string>('');

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // State for remove confirmation
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [plantToRemove, setPlantToRemove] = React.useState<PlantWithPhase | null>(null);
  const [removingPlant, setRemovingPlant] = React.useState(false);

  // Add a new state for combined plant-phase selection
  const [selectedPlantPhase, setSelectedPlantPhase] = React.useState<{ plantId: string; phaseId: string }>({
    plantId: '',
    phaseId: '',
  });

  // Fetch target value details when component mounts or targetValueId changes
  React.useEffect(() => {
    if (open && targetValueId) {
      fetchTargetDetails();
      fetchPhases();
    }
  }, [open, targetValueId]);

  const fetchPhases = async () => {
    try {
      const response = await phaseService.getAllPhases();
      setPhases(response.response.data);
    } catch (error) {
      console.error('Không thể tải danh sách giai đoạn:', error);
    }
  };

  const fetchTargetDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await targetValueService.getTargetValueDetails(targetValueId);
      setTargetDetails(response.response.data);
      console.log('Đã tải thành công chi tiết giá trị mục tiêu:', response.response.data);
    } catch (error) {
      console.error('Không thể tải chi tiết giá trị mục tiêu:', error);
      setError('Không thể tải chi tiết giá trị mục tiêu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Modify the handleOpenAddPlantDialog function
  const handleOpenAddPlantDialog = async () => {
    if (!targetDetails) return;

    setLoadingAvailablePlants(true);
    try {
      const plants = await targetValueService.getPlantsWithoutTargetValueType(targetDetails.type);
      setAvailablePlants(plants);
      setAddPlantDialogOpen(true);
      // Reset selections
      setSelectedPlantId('');
      setSelectedPhaseId('');
    } catch (error) {
      console.error('Không thể tải danh sách cây trồng khả dụng:', error);
    } finally {
      setLoadingAvailablePlants(false);
    }
  };

  // Close the add plant dialog
  const handleCloseAddPlantDialog = () => {
    setAddPlantDialogOpen(false);
    setSelectedPlantId('');
    setSelectedPhaseId('');
  };

  // Add a new handler for the combined selection
  const handlePlantPhaseChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const [plantId, phaseId] = value.split('::');
    setSelectedPlantPhase({ plantId, phaseId });
    setSelectedPlantId(plantId);
    setSelectedPhaseId(phaseId);
  };

  // Assign the selected plant to this target value
  const handleAssignPlant = async () => {
    if (!selectedPlantId || !targetValueId || !selectedPhaseId) return;

    setAssigningPlant(true);
    try {
      await targetValueService.setValueForPlant(selectedPlantId, targetValueId, selectedPhaseId);
      console.log('Đã gán cây trồng vào giá trị mục tiêu thành công');

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
      console.error('Không thể gán cây trồng vào giá trị mục tiêu:', error);

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
        return '';
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
  const handleRemoveClick = (plant: PlantWithPhase, event: React.MouseEvent<HTMLButtonElement>) => {
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
      await targetValueService.removeValueFromPlant(plantToRemove.plantId, targetValueId, plantToRemove.phaseId);
      console.log('Đã xóa giá trị mục tiêu khỏi cây trồng thành công');

      // Close dialog and refresh details
      setRemoveDialogOpen(false);
      setPlantToRemove(null);
      await fetchTargetDetails();

      // Show success message
      setSnackbar({
        open: true,
        message: `Đã xóa giá trị mục tiêu khỏi cây trồng "${plantToRemove.plantName}" thành công`,
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Không thể xóa giá trị mục tiêu khỏi cây trồng:', error);

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
                            <TableCell>Tên cây trồng</TableCell>
                            <TableCell>Giai đoạn</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {targetDetails.plants.map((plant) => (
                            <TableRow key={plant.plantOfPhaseId} hover>
                              <TableCell>
                                <Typography variant="body2">{plant.plantName}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{plant.phaseName}</Typography>
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

      {/* Add Plant Dialog - Updated UI */}
      <Dialog open={addPlantDialogOpen} onClose={handleCloseAddPlantDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm cây trồng vào giá trị mục tiêu này</DialogTitle>
        <DialogContent>
          {availablePlants.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Không tìm thấy cây trồng khả dụng. Tất cả cây trồng đã có giá trị mục tiêu {targetDetails?.type} được
              thiết lập.
            </Typography>
          ) : (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Chọn cây trồng và giai đoạn</InputLabel>
                <Select
                  value={`${selectedPlantId}::${selectedPhaseId}`}
                  onChange={handlePlantPhaseChange}
                  label="Chọn cây trồng và giai đoạn"
                  displayEmpty
                  renderValue={(selected) => {
                    console.log('Selected value:', selected);

                    if (selected === '::') {
                      return <em>Chọn cây trồng và giai đoạn</em>;
                    }

                    const [plantId, phaseId] = selected.split('::');
                    console.log('Plant ID:', plantId, 'Phase ID:', phaseId);

                    if (!plantId || !phaseId) return <em>Chọn cây trồng và giai đoạn</em>;

                    const plant = availablePlants.find((p) => p.id === plantId);
                    const phase = plant?.phases.find((ph) => ph.phaseId === phaseId);
                    console.log('Found plant:', plant, 'Found phase:', phase);

                    if (plant && phase) {
                      const displayText = `${plant.name} - ${phase.phaseName}`;
                      console.log('Display text:', displayText);
                      return displayText;
                    }

                    return <em>Chọn cây trồng và giai đoạn</em>;
                  }}
                >
                  <MenuItem value="::" disabled>
                    <em>Chọn cây trồng và giai đoạn</em>
                  </MenuItem>

                  {availablePlants
                    .map((plant) => [
                      // Group header
                      <MenuItem
                        key={`header-${plant.id}`}
                        value={`header-${plant.id}`}
                        disabled
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          pointerEvents: 'none',
                        }}
                      >
                        {plant.name}
                      </MenuItem>,

                      // Phase options for this plant
                      ...plant.phases.map((phase) => (
                        <MenuItem
                          key={`${plant.id}::${phase.phaseId}`}
                          value={`${plant.id}::${phase.phaseId}`}
                          sx={{ pl: 4 }}
                        >
                          {`${plant.name} - ${phase.phaseName}`}
                        </MenuItem>
                      )),
                    ])
                    .flat()}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddPlantDialog}>Hủy</Button>
          <Button
            onClick={handleAssignPlant}
            variant="contained"
            disabled={!selectedPlantId || !selectedPhaseId || assigningPlant}
          >
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
            Bạn có chắc chắn muốn xóa giá trị mục tiêu này khỏi cây trồng "{plantToRemove?.plantName}" trong giai đoạn "
            {plantToRemove?.phaseName}"? Hành động này không thể hoàn tác.
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
