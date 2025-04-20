'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import productService from '@/services/productService';
import { Alert, Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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
          {/* Import and Export buttons removed */}
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
      <ProductFilters 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <ProductTable 
        count={count} 
        page={page} 
        rowsPerPage={rowsPerPage} 
        refreshTrigger={refreshTrigger}
        searchQuery={searchQuery}
      />

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
