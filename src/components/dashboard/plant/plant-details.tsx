'use client';

import * as React from 'react';
import phaseService, { Phase } from '@/services/phaseService';
import plantService from '@/services/plantService';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CaretDown, Plus, Trash, Warning, X } from '@phosphor-icons/react';

import { Plant, PlantPhase } from '@/types/plant';

import type { TargetValue } from '../../../services/targetValueService';
import targetValueService from '../../../services/targetValueService';
import { ValueType, ValueTypeEnums } from '../../../types/targetValue';

interface PlantDetailsProps {
  open: boolean;
  onClose: () => void;
  plantId: string;
}

function PlantDetails({ open, onClose, plantId }: PlantDetailsProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [plantDetails, setPlantDetails] = React.useState<Plant | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [loadingPhases, setLoadingPhases] = React.useState<boolean>(false);

  // State for target value editing
  const [editingTarget, setEditingTarget] = React.useState<TargetValue | null>(null);
  const [minValue, setMinValue] = React.useState<number>(0);
  const [maxValue, setMaxValue] = React.useState<number>(0);
  const [updateLoading, setUpdateLoading] = React.useState<boolean>(false);
  const [currentPhaseId, setCurrentPhaseId] = React.useState<string>('');

  // State for editing mode
  const [editMode, setEditMode] = React.useState<'values' | 'change'>('values');

  // State for available target values
  const [availableTargetValues, setAvailableTargetValues] = React.useState<TargetValue[]>([]);
  const [selectedTargetId, setSelectedTargetId] = React.useState<string>('');
  const [loadingTargetValues, setLoadingTargetValues] = React.useState<boolean>(false);
  const [selectedPhaseId, setSelectedPhaseId] = React.useState<string>('');

  // State for all possible target value types
  const [allTargetTypes, setAllTargetTypes] = React.useState<ValueType[]>([
    'Ph',
    'SoluteConcentration',
    'Temperature',
    'WaterLevel',
  ]);

  // Create a reference for the timeout to clean it up properly
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clean up timeouts when component unmounts
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch plant details when component mounts or plantId changes
  React.useEffect(() => {
    if (open && plantId) {
      fetchPlantDetails();
      fetchPhases();
    }
  }, [open, plantId]);

  // Handle cancel edit - completely close the dialog
  const handleCancelEdit = () => {
    setEditingTarget(null);
    setSelectedTargetId('');
    setUpdateLoading(false);
    setCurrentPhaseId('');
  };

  // Handle retry button click
  const handleRetry = () => {
    fetchPlantDetails();
  };

  const fetchPhases = async () => {
    setLoadingPhases(true);
    try {
      const response = await phaseService.getAllPhases();
      setPhases(response.response.data);
    } catch (error) {
      console.error('Không thể tải danh sách giai đoạn:', error);
    } finally {
      setLoadingPhases(false);
    }
  };

  const fetchPlantDetails = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await plantService.getPlantById(plantId);
      setPlantDetails(data);
    } catch (error) {
      console.error('Không thể tải thông tin cây trồng:', error);
      setError('Không thể tải thông tin cây trồng. Vui lòng thử lại.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Smoother refresh function that updates without causing a flash
  const refreshDataSmoothly = async () => {
    // Fetch without showing loading state
    await fetchPlantDetails(false);
  };

  // Load available target values of specific type
  const loadAvailableTargetValues = async (type: string) => {
    setLoadingTargetValues(true);
    try {
      const response = await targetValueService.getAllTargetValues(type as ValueType);
      setAvailableTargetValues(response.response.data);
      setLoadingTargetValues(false);
    } catch (error) {
      console.error('Không thể tải danh sách giá trị mục tiêu:', error);
      setLoadingTargetValues(false);
    }
  };

  // Handle edit target value mode
  const handleEditValuesMode = (target: TargetValue, phaseId: string) => {
    setEditingTarget(target);
    setMinValue(target.minValue);
    setMaxValue(target.maxValue);
    setEditMode('values');
    setCurrentPhaseId(phaseId);
  };

  // Handle change target value mode
  const handleChangeMode = (target: TargetValue, phaseId: string) => {
    setEditingTarget(target);
    setEditMode('change');
    setCurrentPhaseId(phaseId);
    loadAvailableTargetValues(target.type);
  };

  // Handle update target value
  const handleUpdateTarget = async () => {
    if (!editingTarget || !plantDetails || !currentPhaseId) return;

    setUpdateLoading(true);
    try {
      // First close the dialog
      const targetId = editingTarget.id;
      const minValueCopy = minValue;
      const maxValueCopy = maxValue;
      const phaseIdCopy = currentPhaseId;

      // Close the dialog immediately
      handleCancelEdit();

      // Then perform the update after a delay
      timeoutRef.current = setTimeout(async () => {
        try {
          await targetValueService.updateTargetValue(
            plantDetails.id,
            targetId,
            phaseIdCopy,
            minValueCopy,
            maxValueCopy
          );

          // Update smoothly without a flash
          await refreshDataSmoothly();
        } catch (error) {
          console.error('Không thể cập nhật giá trị mục tiêu:', error);
        } finally {
          setUpdateLoading(false);
        }
      }, 300);
    } catch (error) {
      console.error('Không thể cập nhật giá trị mục tiêu:', error);
      setUpdateLoading(false);
    }
  };

  // Handle change target
  const handleChangeTarget = async () => {
    if (!plantDetails || !selectedTargetId || !editingTarget || !currentPhaseId) return;

    setUpdateLoading(true);
    try {
      // Store local copies before closing the dialog
      const isExistingTarget = !!editingTarget.id;
      const currentPlantId = plantDetails.id;
      const currentTargetId = editingTarget.id;
      const newTargetId = selectedTargetId;
      const phaseIdCopy = currentPhaseId;

      // Close the dialog immediately
      handleCancelEdit();

      // Perform the operation after a delay
      timeoutRef.current = setTimeout(async () => {
        try {
          if (isExistingTarget) {
            // Change existing target value
            await plantService.changeTargetValue(currentPlantId, currentTargetId, newTargetId, phaseIdCopy);
          } else {
            // Add new target value
            await plantService.setValueForPlant(currentPlantId, newTargetId, phaseIdCopy);
          }

          // Refresh data smoothly
          await refreshDataSmoothly();
        } catch (error) {
          console.error('Không thể thay đổi giá trị mục tiêu:', error);
        } finally {
          setUpdateLoading(false);
        }
      }, 300);
    } catch (error) {
      console.error('Không thể chuẩn bị thay đổi giá trị mục tiêu:', error);
      setUpdateLoading(false);
    }
  };

  // Get target type display name
  const getTargetTypeDisplayName = (type: string): string => {
    switch (type) {
      case 'Temperature':
        return 'Nhiệt độ';
      case 'SoluteConcentration':
        return 'Nồng độ dung dịch';
      case 'WaterLevel':
        return 'Mực nước';
      case 'Ph':
        return 'pH';
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

  // Check if a specific target type is set for the plant in a specific phase
  const isTargetTypeSetInPhase = (type: ValueType, phase: PlantPhase): boolean => {
    return phase.target.some((target) => target.type === type) || false;
  };

  // Handle add target value button click
  const handleAddTargetValue = async (type: ValueType, phaseId: string) => {
    setEditingTarget({ id: '', type, minValue: 0, maxValue: 0 });
    setEditMode('change');
    setCurrentPhaseId(phaseId);
    loadAvailableTargetValues(type);
  };

  // Remove target value from plant
  const handleRemoveTargetValue = async (targetId: string, phaseId: string) => {
    if (!plantDetails) return;

    try {
      await plantService.removeValueFromPlant(plantDetails.id, targetId, phaseId);
      await refreshDataSmoothly();
    } catch (error) {
      console.error('Không thể xóa giá trị mục tiêu:', error);
    }
  };

  const [availablePhases, setAvailablePhases] = React.useState<Phase[]>([]);
  const [isAddPhaseDialogOpen, setIsAddPhaseDialogOpen] = React.useState(false);
  const [selectedNewPhaseId, setSelectedNewPhaseId] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isRemovePhaseDialogOpen, setIsRemovePhaseDialogOpen] = React.useState(false);
  const [phaseToRemove, setPhaseToRemove] = React.useState<{ phaseId: string; phaseName: string } | null>(null);

  // Fetch available phases that haven't been set for this plant
  const fetchAvailablePhases = async () => {
    try {
      const phases = await plantService.getPhasesNotSet(plantId);
      setAvailablePhases(phases);
    } catch (error) {
      console.error('Không thể tải danh sách giai đoạn khả dụng:', error);
    }
  };

  // Handle opening add phase dialog
  const handleOpenAddPhaseDialog = async () => {
    await fetchAvailablePhases();
    setIsAddPhaseDialogOpen(true);
  };

  // Add snackbar state
  const [snackbar, setSnackbar] = React.useState<{
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

  // Update handleAddPhase with error handling
  const handleAddPhase = async () => {
    if (!selectedNewPhaseId) return;

    setIsProcessing(true);
    try {
      await plantService.setPhaseForPlant(plantId, selectedNewPhaseId);
      showSnackbar('Thêm giai đoạn thành công', 'success');
      setIsAddPhaseDialogOpen(false);
      setSelectedNewPhaseId('');
      await fetchPlantDetails();
    } catch (error: any) {
      console.error('Không thể thêm giai đoạn:', error);
      const errorMessage = error.response?.data?.message || 'Không thể thêm giai đoạn';

      // Handle specific error messages
      let displayMessage = errorMessage;
      switch (errorMessage) {
        case 'Plant not found':
          displayMessage = 'Không tìm thấy cây trồng';
          break;
        case 'Phase not found':
          displayMessage = 'Không tìm thấy giai đoạn';
          break;
        case 'Plant already has this phase':
          displayMessage = 'Cây trồng đã có giai đoạn này';
          break;
      }

      showSnackbar(displayMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle opening remove phase dialog
  const handleOpenRemovePhaseDialog = (phaseId: string, phaseName: string) => {
    setPhaseToRemove({ phaseId, phaseName });
    setIsRemovePhaseDialogOpen(true);
  };

  // Update handleRemovePhase with error handling
  const handleRemovePhase = async () => {
    if (!phaseToRemove) return;

    setIsProcessing(true);
    try {
      await plantService.removePhaseForPlant(plantId, phaseToRemove.phaseId);
      showSnackbar('Xóa giai đoạn thành công', 'success');
      setIsRemovePhaseDialogOpen(false);
      setPhaseToRemove(null);
      await fetchPlantDetails();
    } catch (error: any) {
      console.error('Không thể xóa giai đoạn:', error);
      const errorMessage = error.response?.data?.message || 'Không thể xóa giai đoạn';

      // Handle specific error messages
      let displayMessage = errorMessage;
      switch (errorMessage) {
        case 'Plant not found':
          displayMessage = 'Không tìm thấy cây trồng';
          break;
        case 'Plant does not have this phase':
          displayMessage = 'Cây trồng không có giai đoạn này';
          break;
        case 'Cannot remove phase for plant because there are device items using this phase':
          displayMessage = 'Không thể xóa giai đoạn vì có thiết bị đang sử dụng';
          break;
      }

      showSnackbar(displayMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chi tiết cây trồng</Typography>
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
              <Button variant="contained" onClick={handleRetry} sx={{ mt: 2 }}>
                Thử lại
              </Button>
            </Box>
          ) : plantDetails ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <Typography variant="h5">{plantDetails.name}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">Các giai đoạn</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Plus size={20} />}
                        onClick={handleOpenAddPhaseDialog}
                      >
                        Thêm giai đoạn
                      </Button>
                    </Box>
                    <Divider />
                    {plantDetails.phases.map((phase) => (
                      <Accordion key={phase.phaseId}>
                        <AccordionSummary expandIcon={<CaretDown />}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                            <Typography>{phase.phaseName}</Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRemovePhaseDialog(phase.phaseId, phase.phaseName);
                              }}
                            >
                              <Trash size={20} />
                            </IconButton>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Loại</TableCell>
                                  <TableCell>Giá trị tối thiểu</TableCell>
                                  <TableCell>Giá trị tối đa</TableCell>
                                  <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {phase.target.map((target) => (
                                  <TableRow key={target.id}>
                                    <TableCell>{getTargetTypeDisplayName(target.type)}</TableCell>
                                    <TableCell>
                                      {target.minValue} {getTargetTypeUnit(target.type)}
                                    </TableCell>
                                    <TableCell>
                                      {target.maxValue} {getTargetTypeUnit(target.type)}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => handleChangeMode(target, phase.phaseId)}
                                        >
                                          Thay đổi
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          size="small"
                                          onClick={() => handleRemoveTargetValue(target.id, phase.phaseId)}
                                        >
                                          Xóa
                                        </Button>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}

                                {/* Display rows for missing target types */}
                                {allTargetTypes
                                  .filter((type) => !isTargetTypeSetInPhase(type, phase))
                                  .map((type) => (
                                    <TableRow key={type} sx={{ backgroundColor: 'rgba(255, 235, 235, 0.3)' }}>
                                      <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Tooltip title="Chưa thiết lập giá trị mục tiêu">
                                            <Warning size={20} color="#f44336" />
                                          </Tooltip>
                                          {getTargetTypeDisplayName(type)}
                                        </Stack>
                                      </TableCell>
                                      <TableCell>—</TableCell>
                                      <TableCell>—</TableCell>
                                      <TableCell align="right">
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          size="small"
                                          startIcon={<Plus size={18} />}
                                          onClick={() => handleAddTargetValue(type, phase.phaseId)}
                                        >
                                          Thêm
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Add Phase Dialog */}
      <Dialog open={isAddPhaseDialogOpen} onClose={() => !isProcessing && setIsAddPhaseDialogOpen(false)}>
        <DialogTitle>Thêm giai đoạn mới</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Chọn giai đoạn</InputLabel>
            <Select
              value={selectedNewPhaseId}
              onChange={(e) => setSelectedNewPhaseId(e.target.value)}
              label="Chọn giai đoạn"
              disabled={isProcessing}
            >
              {availablePhases.map((phase) => (
                <MenuItem key={phase.id} value={phase.id}>
                  {phase.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddPhaseDialogOpen(false)} disabled={isProcessing}>
            Hủy
          </Button>
          <Button
            onClick={handleAddPhase}
            variant="contained"
            color="primary"
            disabled={!selectedNewPhaseId || isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Đang thêm...' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Phase Dialog */}
      <Dialog open={isRemovePhaseDialogOpen} onClose={() => !isProcessing && setIsRemovePhaseDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa giai đoạn</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa giai đoạn "{phaseToRemove?.phaseName}" khỏi cây trồng này? Hành động này không thể
            hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRemovePhaseDialogOpen(false)} disabled={isProcessing}>
            Hủy
          </Button>
          <Button
            onClick={handleRemovePhase}
            variant="contained"
            color="error"
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Target Value Dialog */}
      <Dialog
        open={!!editingTarget}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onExited: () => {
            // This ensures any visual jank happens after the dialog is fully closed
            if (!updateLoading) {
              fetchPlantDetails(false);
            }
          },
        }}
      >
        <DialogTitle>
          {editMode === 'values'
            ? 'Chỉnh sửa giá trị mục tiêu'
            : editingTarget?.id
              ? 'Thay đổi giá trị mục tiêu'
              : 'Thêm giá trị mục tiêu'}
        </DialogTitle>
        <DialogContent>
          {editingTarget && editMode === 'values' && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {getTargetTypeDisplayName(editingTarget.type)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Giá trị tối thiểu"
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(Number(e.target.value))}
                    fullWidth
                    InputProps={{
                      endAdornment: getTargetTypeUnit(editingTarget.type),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Giá trị tối đa"
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(Number(e.target.value))}
                    fullWidth
                    InputProps={{
                      endAdornment: getTargetTypeUnit(editingTarget.type),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {editingTarget && editMode === 'change' && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {getTargetTypeDisplayName(editingTarget.type)}
              </Typography>
              {loadingTargetValues ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Chọn giá trị mục tiêu</InputLabel>
                  <Select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    label="Chọn giá trị mục tiêu"
                  >
                    {availableTargetValues.map((targetValue) => (
                      <MenuItem key={targetValue.id} value={targetValue.id}>
                        {getTargetTypeDisplayName(targetValue.type)} ({targetValue.minValue} - {targetValue.maxValue}{' '}
                        {getTargetTypeUnit(targetValue.type)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} disabled={updateLoading}>
            Hủy
          </Button>
          {editMode === 'values' ? (
            <Button onClick={handleUpdateTarget} variant="contained" disabled={updateLoading}>
              {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          ) : (
            <Button onClick={handleChangeTarget} variant="contained" disabled={updateLoading || !selectedTargetId}>
              {updateLoading ? 'Đang xử lý...' : editingTarget?.id ? 'Thay đổi' : 'Thêm'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Snackbar for notifications */}
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
}

export default PlantDetails;
