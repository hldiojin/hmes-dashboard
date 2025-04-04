'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import categoryService from '@/services/categoryService';
import { Alert, Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

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
        message: `Category "${response.response.data.name}" created successfully`,
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
        message: 'Failed to create category',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Categories</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Import
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleOpenModal}
          >
            Add
          </Button>
        </div>
      </Stack>
      <CategoryFilters />
      <CategoryTable count={count} page={page} rowsPerPage={rowsPerPage} refreshTrigger={refreshTrigger} />

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
