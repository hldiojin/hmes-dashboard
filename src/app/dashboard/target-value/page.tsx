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

  // Handle refresh
  const handleRefresh = () => {
    console.log('Refreshing target values with trigger increment');
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Performing search with:', { type, minValue, maxValue });
    setPage(0); // Quay về trang đầu khi tìm kiếm
    handleRefresh();
  };

  // Reset all filters
  const resetFilters = () => {
    setType(null);
    setMinValue('');
    setMaxValue('');
    setPage(0);
    handleRefresh();
  };

  // Handle type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    const newType = event.target.value === '' ? null : (event.target.value as ValueType);
    setType(newType);
    setPage(0);
    // Không gọi handleRefresh() ở đây để tránh tìm kiếm tự động khi thay đổi dropdown
  };

  // Handle min value change
  const handleMinValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinValue(e.target.value);
  };

  // Handle max value change
  const handleMaxValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxValue(e.target.value);
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

  // Handle successful creation
  const handleCreateSuccess = () => {
    // Hiển thị thông báo thành công
    setSnackbar({
      open: true,
      message: 'Giá trị mục tiêu đã được tạo thành công',
      severity: 'success',
    });
    
    // Đặt lại trang về trang đầu tiên để hiển thị dữ liệu mới
    setPage(0);
    
    // Đặt lại bộ lọc để hiển thị tất cả các giá trị mục tiêu
    resetFilters();
    
    // Làm mới dữ liệu
    console.log('Forcing refresh after target value creation');
    handleRefresh();
  };

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
          <Typography variant="h4">Giá trị mục tiêu</Typography>
          <Button startIcon={<Plus />} variant="contained" onClick={handleCreateModalOpen}>
            Thêm giá trị mục tiêu
          </Button>
        </Stack>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="type-filter-label">Loại</InputLabel>
              <Select
                labelId="type-filter-label"
                value={type === null ? '' : type}
                label="Loại"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Ph">pH</MenuItem>
                <MenuItem value="SoluteConcentration">Nồng độ dung dịch</MenuItem>
                <MenuItem value="Temperature">Nhiệt độ nước</MenuItem>
                <MenuItem value="WaterLevel">Mực nước</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Giá trị tối thiểu"
              type="number"
              value={minValue}
              onChange={handleMinValueChange}
              sx={{ width: 150 }}
            />
            <TextField
              label="Giá trị tối đa"
              type="number"
              value={maxValue}
              onChange={handleMaxValueChange}
              sx={{ width: 150 }}
            />
            <Button type="submit" variant="contained">
              Tìm kiếm
            </Button>
            <Button type="button" variant="outlined" onClick={resetFilters}>
              Đặt lại
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
        onSuccess={handleCreateSuccess}
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
