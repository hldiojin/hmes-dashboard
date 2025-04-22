'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import categoryService from '@/services/categoryService';
import { Alert, Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { CategoryFilters } from '@/components/dashboard/category/category-filter';
import CategoryModal from '@/components/dashboard/category/category-modal';
import CategoryTable from '@/components/dashboard/category/category-table';

function Category(): React.JSX.Element {
  const router = useRouter();
  const page = 0;
  const rowsPerPage = 5;
  const count = 0;

  // Add a refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await categoryService.createCategory(formData);

      // Show success message with the new category name
      setSnackbar({
        open: true,
        message: `Loại sản phẩm "${response.response.data.name}" đã được tạo thành công`,
        severity: 'success',
      });

      // Trigger a refresh of the table data
      setRefreshTrigger((prev) => prev + 1);

      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error('Error creating category:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tạo loại sản phẩm',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Loại sản phẩm</Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleOpenModal}
          >
            Thêm
          </Button>
        </div>
      </Stack>
      <CategoryFilters 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <CategoryTable 
        count={count} 
        page={page} 
        rowsPerPage={rowsPerPage} 
        refreshTrigger={refreshTrigger}
        searchQuery={searchQuery}
      />

      <CategoryModal open={modalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} />

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
    </Stack>
  );
}

export default Category;
