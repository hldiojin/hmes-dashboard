'use client';

import * as React from 'react';
import plantService from '@/services/plantService';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Plus } from '@phosphor-icons/react';

import PlantDetails from '@/components/dashboard/plant/plant-details';
import PlantModal from '@/components/dashboard/plant/plant-modal';
import PlantTable from '@/components/dashboard/plant/plant-table';

export default function PlantPage(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [keyword, setKeyword] = React.useState('');
  const [status, setStatus] = React.useState<'Active' | 'Inactive' | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // State for create modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);

  // State for details modal
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedPlantId, setSelectedPlantId] = React.useState<string | null>(null);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleRefresh();
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value === '' ? null : (event.target.value as 'Active' | 'Inactive');
    setStatus(newStatus);
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
  const handleCreateSubmit = async (name: string, status: 'Active' | 'Inactive') => {
    setCreateLoading(true);
    try {
      await plantService.createPlant(name, status);
      handleCreateModalClose();
      handleRefresh();
    } catch (error) {
      console.error('Error creating plant:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle details modal open
  const handleDetailsModalOpen = (plantId: string) => {
    setSelectedPlantId(plantId);
    setDetailsModalOpen(true);
  };

  // Handle details modal close
  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedPlantId(null);
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4}>
          <Typography variant="h4">Plants</Typography>
          <Button startIcon={<Plus />} variant="contained" onClick={handleCreateModalOpen}>
            Add Plant
          </Button>
        </Stack>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Search plants"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{ width: 300 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={status === null ? '' : status}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained">
              Search
            </Button>
          </Stack>
        </Box>

        <PlantTable
          page={page}
          rowsPerPage={rowsPerPage}
          refreshTrigger={refreshTrigger}
          onRefreshNeeded={handleRefresh}
          keyword={keyword}
          status={status}
          onRowClick={handleDetailsModalOpen}
        />
      </Stack>

      {/* Create Modal */}
      <PlantModal open={createModalOpen} onClose={handleCreateModalClose} onSubmit={handleCreateSubmit} mode="create" />

      {/* Details Modal */}
      {selectedPlantId && (
        <PlantDetails open={detailsModalOpen} onClose={handleDetailsModalClose} plantId={selectedPlantId} />
      )}
    </Container>
  );
}
