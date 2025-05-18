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
import { Leaf, Plus } from '@phosphor-icons/react';

import PlantDetails from '@/components/dashboard/plant/plant-details';
import PlantModal from '@/components/dashboard/plant/plant-modal';
import PlantTable from '@/components/dashboard/plant/plant-table';
import PhaseManagement from '@/components/phase/PhaseManagement';

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

  // State for phase management modal
  const [phaseModalOpen, setPhaseModalOpen] = React.useState(false);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleRefresh();
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
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

  // Handle phase modal open/close
  const handlePhaseModalOpen = () => {
    setPhaseModalOpen(true);
  };

  const handlePhaseModalClose = () => {
    setPhaseModalOpen(false);
  };

  // Handle create submit
  const handleCreateSubmit = async (name: string, status: 'Active' | 'Inactive') => {
    setCreateLoading(true);
    try {
      await plantService.createPlant(name, status);
      handleCreateModalClose();

      // Reset to first page and clear filters to ensure new plant is visible
      setPage(0);
      setKeyword('');
      setStatus(null);

      // Force a refresh of the table
      handleRefresh();
    } catch (error) {
      console.error('Lỗi khi tạo cây trồng:', error);
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Cây trồng</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="primary" onClick={handlePhaseModalOpen} startIcon={<Leaf weight="fill" />}>
            Quản lý giai đoạn
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateModalOpen}
            startIcon={<Plus weight="fill" />}
          >
            Thêm cây trồng
          </Button>
        </Stack>
      </Stack>

      <form onSubmit={handleSearch}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            size="small"
            label="Tìm kiếm"
            value={keyword}
            onChange={handleSearchChange}
            sx={{ minWidth: 240 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              value={status || ''}
              onChange={handleStatusFilterChange}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Active">Hoạt động</MenuItem>
              <MenuItem value="Inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="outlined">
            Tìm kiếm
          </Button>
        </Stack>
      </form>

      <Box sx={{ position: 'relative', pb: 4 }}>
        <PlantTable
          refreshTrigger={refreshTrigger}
          keyword={keyword}
          status={status}
          page={page}
          rowsPerPage={rowsPerPage}
          onRowClick={handleDetailsModalOpen}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRefreshNeeded={handleRefresh}
        />
      </Box>

      {/* Create Modal */}
      <PlantModal open={createModalOpen} onClose={handleCreateModalClose} onSubmit={handleCreateSubmit} mode="create" />

      {/* Details Modal */}
      {selectedPlantId && (
        <PlantDetails open={detailsModalOpen} onClose={handleDetailsModalClose} plantId={selectedPlantId} />
      )}

      {/* Phase Management Modal */}
      <PhaseManagement open={phaseModalOpen} onClose={handlePhaseModalClose} />
    </Container>
  );
}
