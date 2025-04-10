'use client';

import * as React from 'react';
import productService from '@/services/productService';
import { Alert, Snackbar } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PencilSimple, Trash } from '@phosphor-icons/react';

import { Product } from '@/types/product';
import { useSelection } from '@/hooks/use-selection';

import ProductModal from './product-modal';

function noop(): void {
  // do nothing
}

interface ProductTableProps {
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
}

function ProductTable({
  count = 0,
  page = 0,
  rowsPerPage = 0,
  refreshTrigger = 0,
  onRefreshNeeded,
}: ProductTableProps): React.JSX.Element {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
  const [editLoading, setEditLoading] = React.useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch products when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAllProducts();
        setProducts(response.response.data);
        setTotalCount(response.response.data.length);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshTrigger]);

  const rowIds = React.useMemo(() => {
    return products.map((product) => product.id);
  }, [products]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  // Reset selection when products change
  React.useEffect(() => {
    if (selected.size > 0) {
      deselectAll();
    }
  }, [products, deselectAll, selected.size]);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < products.length;
  const selectedAll = products.length > 0 && selected?.size === products.length;

  // Handle delete button click
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = async (product: Product) => {
    setEditLoading(true);
    try {
      const response = await productService.getProductById(product.id);
      console.log('Full API response:', response);
      console.log('Response structure:', {
        hasResponse: !!response.response,
        hasData: !!response.response?.data,
        dataType: typeof response.response?.data,
        isArray: Array.isArray(response.response?.data),
        dataLength: Array.isArray(response.response?.data) ? response.response.data.length : 'not an array',
      });

      if (response.response?.data) {
        // If data is an array, take the first item
        const productData = Array.isArray(response.response.data) ? response.response.data[0] : response.response.data;

        if (productData) {
          setProductToEdit(productData);
          setEditModalOpen(true);
        } else {
          setSnackbar({
            open: true,
            message: 'Product not found',
            severity: 'error',
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Product not found',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch product details',
        severity: 'error',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = async (product: Product) => {
    setEditLoading(true);
    try {
      const response = await productService.getProductById(product.id);
      console.log('Full API response:', response);
      console.log('Response structure:', {
        hasResponse: !!response.response,
        hasData: !!response.response?.data,
        dataType: typeof response.response?.data,
        isArray: Array.isArray(response.response?.data),
        dataLength: Array.isArray(response.response?.data) ? response.response.data.length : 'not an array',
      });

      if (response.response?.data) {
        // If data is an array, take the first item
        const productData = Array.isArray(response.response.data) ? response.response.data[0] : response.response.data;

        if (productData) {
          setProductToEdit(productData);
          setEditModalOpen(true);
        } else {
          setSnackbar({
            open: true,
            message: 'Product not found',
            severity: 'error',
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Product not found',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch product details',
        severity: 'error',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle confirmation dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Handle edit modal close
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setProductToEdit(null);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    try {
      await productService.deleteProduct(productToDelete.id);

      // Close dialog
      setDeleteDialogOpen(false);
      setProductToDelete(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Product "${productToDelete.name}" deleted successfully`,
        severity: 'success',
      });

      // Trigger refresh either through callback or internal refresh
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        // Refresh the list internally
        const response = await productService.getAllProducts();
        setProducts(response.response.data);
        setTotalCount(response.response.data.length);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete product',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (formData: FormData) => {
    if (!productToEdit) return;

    setEditLoading(true);
    try {
      await productService.updateProduct(productToEdit.id, formData);

      // Close modal
      setEditModalOpen(false);
      setProductToEdit(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Product "${productToEdit.name}" updated successfully`,
        severity: 'success',
      });

      // Trigger refresh either through callback or internal refresh
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        // Refresh the list internally
        const response = await productService.getAllProducts();
        setProducts(response.response.data);
        setTotalCount(response.response.data.length);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update product',
        severity: 'error',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" py={2}>
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isSelected = selected?.has(product.id);
                  return (
                    <TableRow
                      hover
                      selected={isSelected}
                      key={product.id}
                      onClick={() => handleRowClick(product)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{product.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={product.mainImage} variant="rounded" sx={{ width: 40, height: 40 }} />
                          <Typography variant="subtitle2">{product.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{product.amount}</TableCell>
                      <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          color={product.status === 'Active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Delete product">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(product);
                              }}
                            >
                              <Trash size={20} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={totalCount}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <ProductModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        product={productToEdit || undefined}
        mode="update"
      />

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
    </>
  );
}

export default ProductTable;
