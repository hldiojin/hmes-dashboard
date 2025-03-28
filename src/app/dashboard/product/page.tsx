'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import productService from '@/services/productService';
import { Alert, Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

import { ProductFilters } from '@/components/dashboard/product/product-filter';
import ProductModal from '@/components/dashboard/product/product-modal';
import ProductTable from '@/components/dashboard/product/product-table';

function Products(): React.JSX.Element {
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      await productService.createProduct(formData);

      setSnackbar({
        open: true,
        message: 'Product created successfully',
        severity: 'success',
      });

      // Refresh the table
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error creating product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create product',
        severity: 'error',
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Products</Typography>
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
      <ProductFilters />
      <ProductTable count={count} page={page} rowsPerPage={rowsPerPage} refreshTrigger={refreshTrigger} />

      <ProductModal open={modalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} mode="create" />

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

export default Products;
