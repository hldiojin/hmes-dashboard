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
import usePageTitle from '@/lib/hooks/usePageTitle';
import TargetValueDetails from '@/components/dashboard/target-value/target-value-details';
import TargetValueModal from '@/components/dashboard/target-value/target-value-modal';
import TargetValueTable from '@/components/dashboard/target-value/target-value-table';

export default function TargetValuePage(): React.JSX.Element {
  // Set page title
  usePageTitle('Giá trị mục tiêu');

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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('Đã chuyển đến trang:', newPage);
    // Debounce page changes to avoid multiple API requests
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    console.log('Đã thay đổi số hàng mỗi trang thành:', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Defer refresh to avoid race conditions
    setTimeout(() => handleRefresh(), 100);
  };

  // Debounced refresh to prevent excessive API calls
  const debouncedRefresh = React.useCallback(() => {
    const timer = setTimeout(() => {
      console.log('Đang làm mới danh sách giá trị mục tiêu (debounced)');
      setRefreshTrigger((prev) => prev + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Fix loading issues with an improved refresh method
  const handleRefresh = () => {
    console.log('Refreshing target values with:', { page, rowsPerPage, type, minValue, maxValue });
    // Use a new reference for refreshTrigger to guarantee React detects the change
    setRefreshTrigger(Date.now());
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tìm kiếm với điều kiện:', { type, minValue, maxValue });

    // Use startTransition to batch state updates
    React.startTransition(() => {
      // Reset to first page when searching
      setPage(0);

      // Trigger refresh after search
      setTimeout(() => {
        console.log('Refreshing after search');
        setRefreshTrigger(Date.now());
      }, 0);
    });
  };

  // Reset all filters
  const resetFilters = () => {
    console.log('Đặt lại tất cả bộ lọc');

    // Batch all state changes
    React.startTransition(() => {
      setType(null);
      setMinValue('');
      setMaxValue('');
      setPage(0);

      // Trigger refresh once after the next render
      setTimeout(() => {
        console.log('Refreshing after filter reset');
        setRefreshTrigger(Date.now());
      }, 0);
    });
  };

  // Handle type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    const newType = event.target.value === '' ? null : (event.target.value as ValueType);
    console.log('Đã thay đổi bộ lọc loại thành:', newType);

    // Use startTransition to batch state updates
    React.startTransition(() => {
      // Set the type filter
      setType(newType);

      // Always reset to first page when changing filter
      setPage(0);

      // Trigger refresh after type change
      setTimeout(() => {
        console.log('Refreshing after type filter change');
        setRefreshTrigger(Date.now());
      }, 0);
    });
  };

  // Handle min value change
  const handleMinValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinValue(e.target.value);
    // Reset to first page when changing filter value
    setPage(0);
  };

  // Handle max value change
  const handleMaxValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxValue(e.target.value);
    // Reset to first page when changing filter value
    setPage(0);
  };

  // Handle create modal open
  const handleCreateModalOpen = () => {
    console.log('Mở modal tạo giá trị mục tiêu mới');
    setCreateModalOpen(true);
  };

  // Handle create modal close
  const handleCreateModalClose = () => {
    console.log('Đóng modal tạo giá trị mục tiêu');
    setCreateModalOpen(false);
  };

  // Handle successful creation
  const handleCreateSuccess = () => {
    console.log('Tạo giá trị mục tiêu thành công');

    // Use startTransition to batch all state updates
    React.startTransition(() => {
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'Giá trị mục tiêu đã được tạo thành công',
        severity: 'success',
      });

      // Đặt lại trang về trang đầu tiên để hiển thị dữ liệu mới
      setPage(0);

      // Đặt lại các bộ lọc
      setType(null);
      setMinValue('');
      setMaxValue('');

      // Trigger a single refresh after all state updates
      setTimeout(() => {
        console.log('Refreshing after successful creation');
        setRefreshTrigger(Date.now());
      }, 0);
    });
  };

  // Handle row click to open details
  const handleRowClick = (targetValueId: string) => {
    console.log('Mở chi tiết giá trị mục tiêu:', targetValueId);
    setSelectedTargetValueId(targetValueId);
    setDetailsModalOpen(true);
  };

  // Handle details modal close
  const handleDetailsModalClose = () => {
    console.log('Đóng modal chi tiết giá trị mục tiêu');
    setDetailsModalOpen(false);
    setSelectedTargetValueId(null);
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Utility function to log API calls for debugging
  const logApiCalls = React.useCallback(
    (pageNum: number, rowsPerPageNum: number) => {
      console.log('API call params:', {
        page: pageNum,
        rowsPerPage: rowsPerPageNum,
        type,
        minValue: minValue ? Number(minValue) : null,
        maxValue: maxValue ? Number(maxValue) : null,
        timestamp: new Date().toISOString(),
      });
    },
    [type, minValue, maxValue]
  );

  // Add an effect to monitor page changes for debugging
  React.useEffect(() => {
    logApiCalls(page, rowsPerPage);
  }, [page, rowsPerPage, logApiCalls]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4}>
          <Typography variant="h4">Giá trị mục tiêu</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => {
                console.log('Manual refresh requested');
                setRefreshTrigger(Date.now());
              }}
            >
              Làm mới
            </Button>
            <Button startIcon={<Plus />} variant="contained" onClick={handleCreateModalOpen}>
              Thêm giá trị mục tiêu
            </Button>
          </Stack>
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
      <TargetValueModal open={createModalOpen} onClose={handleCreateModalClose} onSuccess={handleCreateSuccess} />

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
