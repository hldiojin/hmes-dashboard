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

// Update the interface to include searchQuery
interface ProductTableProps {
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
  searchQuery?: string; // Add this
}

function ProductTable({
  count = 0,
  page = 0,
  rowsPerPage = 0,
  refreshTrigger = 0,
  onRefreshNeeded,
  searchQuery = '', // Add this with default value
}: ProductTableProps): React.JSX.Element {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]); // Add this
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

  // Add this effect to filter products based on searchQuery
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  // Use filteredProducts for rowIds instead of products
  const rowIds = React.useMemo(() => {
    return filteredProducts.map((product) => product.id);
  }, [filteredProducts]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  // Reset selection when products change
  React.useEffect(() => {
    if (selected.size > 0) {
      deselectAll();
    }
  }, [products, deselectAll, selected.size]);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < filteredProducts.length;
  const selectedAll = filteredProducts.length > 0 && selected?.size === filteredProducts.length;

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
        message: `Sản phẩm "${productToDelete.name}" đã xóa thành công`,
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
        message: 'Không thể xóa sản phẩm',
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
        message: `Sản phẩm "${productToEdit.name}" đã cập nhật thành công`,
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
        message: 'Không thể cập nhật sản phẩm',
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
                <TableCell>Tên</TableCell>
                <TableCell>Loại sản phẩm</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" py={2}>
                      {products.length === 0 ? "Không tìm thấy sản phẩm nào" : "Không tìm thấy sản phẩm phù hợp"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
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
                          label={product.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                          color={product.status === 'Active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Xóa sản phẩm">
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
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Xóa sản phẩm</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
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
