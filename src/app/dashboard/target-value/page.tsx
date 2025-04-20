'use client';

import * as React from 'react';
import targetValueService from '@/services/targetValueService';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Plus } from '@phosphor-icons/react';

import { TargetValue, ValueType } from '@/types/targetValue';
import TargetValueDetails from '@/components/dashboard/target-value/target-value-details';
import TargetValueModal from '@/components/dashboard/target-value/target-value-modal';
import TargetValueTable from '@/components/dashboard/target-value/target-value-table';

export default function TargetValuePage(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [type, setType] = React.useState<ValueType | null>(null);
  const [minValue, setMinValue] = React.useState<string>('');
  const [maxValue, setMaxValue] = React.useState<string>('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // State for create modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);

  // State for details modal
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedTargetValueId, setSelectedTargetValueId] = React.useState<string | null>(null);

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // New state for just created
  const [justCreated, setJustCreated] = React.useState<boolean>(false);

  // Handle refresh
  const handleRefresh = () => {
    console.log('Refreshing target values...');
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleRefresh();
  };

  // Handle type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    const newType = event.target.value === '' ? null : (event.target.value as ValueType);
    setType(newType);
    setPage(0);
    handleRefresh();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Handle create modal open
  const handleCreateModalOpen = () => {
    setCreateModalOpen(true);
  };

  // Handle create modal close
  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  // Handle create submit
  const handleCreateSubmit = async (data: Partial<TargetValue>) => {
    setCreateLoading(true);
    try {
      if (data.type && typeof data.minValue === 'number' && typeof data.maxValue === 'number') {
        // Create the target value
        await targetValueService.createTargetValue({
          type: data.type,
          minValue: data.minValue,
          maxValue: data.maxValue
        });
        
        handleCreateModalClose();
        
        setType(data.type);
        
        setMinValue('');
        setMaxValue('');
        
        setSnackbar({
          open: true,
          message: 'Target value created successfully',
          severity: 'success',
        });
        
        // Add a slightly longer delay before refreshing
        setTimeout(() => {
          console.log('Forcing refresh after target value creation');
          setRefreshTrigger(prev => prev + 1);
        }, 800);
      }
    } catch (error: any) {
      console.error('Error creating target value:', error);

      // Extract error message from response if available
      let errorMessage = 'Failed to create target value';
      if (error.response?.data?.response?.message) {
        errorMessage = error.response.data.response.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Add useEffect to watch for justCreated state
  React.useEffect(() => {
    if (justCreated) {
      // Reset after a short delay
      const timer = setTimeout(() => {
        setJustCreated(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [justCreated]);

  // Handle row click to open details
  const handleRowClick = (targetValueId: string) => {
    setSelectedTargetValueId(targetValueId);
    setDetailsModalOpen(true);
  };

  // Handle details modal close
  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedTargetValueId(null);
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4}>
          <Typography variant="h4">Target Values</Typography>
          <Button startIcon={<Plus />} variant="contained" onClick={handleCreateModalOpen}>
            Add Target Value
          </Button>
        </Stack>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={type === null ? '' : type}
                label="Type"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Ph">pH</MenuItem>
                <MenuItem value="SoluteConcentration">Concentration of Solutes</MenuItem>
                <MenuItem value="Temperature">Water Temperature</MenuItem>
                <MenuItem value="WaterLevel">Water Level</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Min Value"
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              sx={{ width: 150 }}
            />
            <TextField
              label="Max Value"
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              sx={{ width: 150 }}
            />
            <Button type="submit" variant="contained">
              Search
            </Button>
          </Stack>
        </Box>

        <TargetValueTable
          page={page}
          rowsPerPage={rowsPerPage}
          refreshTrigger={refreshTrigger}
          onRefreshNeeded={handleRefresh}
          type={type}
          minValue={minValue ? Number(minValue) : null}
          maxValue={maxValue ? Number(maxValue) : null}
          onRowClick={handleRowClick}
        />
      </Stack>

      {/* Create Modal */}
      <TargetValueModal
        open={createModalOpen}
        onClose={handleCreateModalClose}
        onSubmit={handleCreateSubmit}
        mode="create"
      />

      {/* Details Modal */}
      {selectedTargetValueId && (
        <TargetValueDetails
          open={detailsModalOpen}
          onClose={handleDetailsModalClose}
          targetValueId={selectedTargetValueId}
        />
      )}

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
    </Container>
  );
}
