'use client';

import * as React from 'react';
import {
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
import { Plus, Warning, X } from '@phosphor-icons/react';

import type { PlantDetails as PlantDetailsType, TargetValue } from '../../../services/targetValueService';
import targetValueService from '../../../services/targetValueService';
import { ValueType, ValueTypeEnums } from '../../../types/targetValue';

interface PlantDetailsProps {
  open: boolean;
  onClose: () => void;
  plantId: string;
}

function PlantDetails({ open, onClose, plantId }: PlantDetailsProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [plantDetails, setPlantDetails] = React.useState<PlantDetailsType | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // State for target value editing
  const [editingTarget, setEditingTarget] = React.useState<TargetValue | null>(null);
  const [minValue, setMinValue] = React.useState<number>(0);
  const [maxValue, setMaxValue] = React.useState<number>(0);
  const [updateLoading, setUpdateLoading] = React.useState<boolean>(false);

  // State for editing mode
  const [editMode, setEditMode] = React.useState<'values' | 'change'>('values');

  // State for available target values
  const [availableTargetValues, setAvailableTargetValues] = React.useState<TargetValue[]>([]);
  const [selectedTargetId, setSelectedTargetId] = React.useState<string>('');
  const [loadingTargetValues, setLoadingTargetValues] = React.useState<boolean>(false);

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
    }
  }, [open, plantId]);

  // Handle cancel edit - completely close the dialog
  const handleCancelEdit = () => {
    setEditingTarget(null);
    setSelectedTargetId('');
    setUpdateLoading(false);
  };

  // Handle retry button click
  const handleRetry = () => {
    fetchPlantDetails();
  };

  const fetchPlantDetails = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await targetValueService.getPlantDetails(plantId);
      setPlantDetails(response.response.data);
    } catch (error) {
      console.error('Failed to fetch plant details:', error);
      setError('Failed to load plant details. Please try again.');
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
      console.error('Failed to load target values:', error);
      setLoadingTargetValues(false);
    }
  };

  // Handle edit target value mode
  const handleEditValuesMode = (target: TargetValue) => {
    setEditingTarget(target);
    setMinValue(target.minValue);
    setMaxValue(target.maxValue);
    setEditMode('values');
  };

  // Handle change target value mode
  const handleChangeMode = (target: TargetValue) => {
    setEditingTarget(target);
    setEditMode('change');
    loadAvailableTargetValues(target.type);
  };

  // Handle update target value
  const handleUpdateTarget = async () => {
    if (!editingTarget || !plantDetails) return;

    setUpdateLoading(true);
    try {
      // First close the dialog
      const targetId = editingTarget.id;
      const minValueCopy = minValue;
      const maxValueCopy = maxValue;

      // Close the dialog immediately
      handleCancelEdit();

      // Then perform the update after a delay
      timeoutRef.current = setTimeout(async () => {
        try {
          await targetValueService.updateTargetValue(plantDetails.id, targetId, minValueCopy, maxValueCopy);

          // Update smoothly without a flash
          await refreshDataSmoothly();
        } catch (error) {
          console.error('Failed to update target value:', error);
        } finally {
          setUpdateLoading(false);
        }
      }, 300);
    } catch (error) {
      console.error('Failed to update target value:', error);
      setUpdateLoading(false);
    }
  };

  // Handle change target
  const handleChangeTarget = async () => {
    if (!plantDetails || !selectedTargetId || !editingTarget) return;

    setUpdateLoading(true);
    try {
      // Store local copies before closing the dialog
      const isExistingTarget = !!editingTarget.id;
      const currentPlantId = plantDetails.id;
      const currentTargetId = editingTarget.id;
      const newTargetId = selectedTargetId;

      // Close the dialog immediately
      handleCancelEdit();

      // Perform the operation after a delay
      timeoutRef.current = setTimeout(async () => {
        try {
          if (isExistingTarget) {
            // Change existing target value
            await targetValueService.changeTargetValue(currentPlantId, currentTargetId, newTargetId);
          } else {
            // Add new target value
            await targetValueService.setValueForPlant(currentPlantId, newTargetId);
          }

          // Refresh data smoothly
          await refreshDataSmoothly();
        } catch (error) {
          console.error('Failed to change target value:', error);
        } finally {
          setUpdateLoading(false);
        }
      }, 300);
    } catch (error) {
      console.error('Failed to prepare target value change:', error);
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
        return 'cm';
      case 'Ph':
        return '';
      default:
        return '';
    }
  };

  // Check if a specific target type is set for the plant
  const isTargetTypeSet = (type: ValueType): boolean => {
    return plantDetails?.target.some((target) => target.type === type) || false;
  };

  // Handle add target value button click
  const handleAddTargetValue = async (type: ValueType) => {
    setEditingTarget({ id: '', type, minValue: 0, maxValue: 0 });
    setEditMode('change');
    loadAvailableTargetValues(type);
  };

  return (
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
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h5">{plantDetails.name}</Typography>
                  {/* Status chip hidden but status data still present in the plantDetails object */}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Giá trị mục tiêu
                </Typography>
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
                      {plantDetails.target.map((target) => (
                        <TableRow key={target.id}>
                          <TableCell>{getTargetTypeDisplayName(target.type)}</TableCell>
                          <TableCell>
                            {target.minValue} {getTargetTypeUnit(target.type)}
                          </TableCell>
                          <TableCell>
                            {target.maxValue} {getTargetTypeUnit(target.type)}
                          </TableCell>
                          <TableCell align="right">
                            <Button variant="outlined" size="small" onClick={() => handleChangeMode(target)}>
                              Thay đổi mục tiêu
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Display rows for missing target types */}
                      {allTargetTypes
                        .filter((type) => !isTargetTypeSet(type))
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
                                onClick={() => handleAddTargetValue(type)}
                              >
                                Thêm
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

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
                              {getTargetTypeDisplayName(targetValue.type)} ({targetValue.minValue} -{' '}
                              {targetValue.maxValue} {getTargetTypeUnit(targetValue.type)})
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
                  <Button
                    onClick={handleChangeTarget}
                    variant="contained"
                    disabled={updateLoading || !selectedTargetId}
                  >
                    {updateLoading ? 'Đang xử lý...' : editingTarget?.id ? 'Thay đổi' : 'Thêm'}
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlantDetails;
