'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import productService from '@/services/productService';
import { Alert, Box, Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { ProductFilters } from '@/components/dashboard/product/product-filter';
import ProductModal from '@/components/dashboard/product/product-modal';
import ProductTable from '@/components/dashboard/product/product-table';

function Products(): React.JSX.Element {
  const router = useRouter();

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
    // Refresh product list after modal closes
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Refresh the product list with the new search query
    setRefreshTrigger((prev) => prev + 1);
  };

  // Function to handle product refresh when needed
  const handleRefreshNeeded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle form submission for creating products
  const handleSubmit = async (formData: FormData) => {
    try {
      // Handle product creation
      await productService.createProduct(formData);

      setModalOpen(false);
      // Refresh the product list
      setRefreshTrigger((prev) => prev + 1);
      // Show success message
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã được tạo thành công',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tạo sản phẩm. Vui lòng thử lại',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4} sx={{ mb: 3 }}>
        <Typography variant="h4">Quản lý sản phẩm</Typography>
        <Button startIcon={<PlusIcon />} onClick={handleOpenModal} variant="contained">
          Tạo sản phẩm
        </Button>
      </Stack>

      <Stack spacing={3} sx={{ mb: 3 }}>
        <ProductFilters
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
        />
      </Stack>

      <ProductTable refreshTrigger={refreshTrigger} onRefreshNeeded={handleRefreshNeeded} searchQuery={searchQuery} />

      <ProductModal open={modalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} mode="create" />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Products;
