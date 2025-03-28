'use client';

import * as React from 'react';
import categoryService from '@/services/categoryService';
import { Alert, Snackbar } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
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
import { CaretDown as ChevronDown, CaretRight as ChevronRight, Trash } from '@phosphor-icons/react';

import { Category } from '@/types/category';
import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // do nothing
}

interface CategoryTableProps {
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void; // New callback for parent component to refresh
}

function CategoryTable({
  count = 0,
  page = 0,
  rowsPerPage = 0,
  refreshTrigger = 0,
  onRefreshNeeded,
}: CategoryTableProps): React.JSX.Element {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [totalCount, setTotalCount] = React.useState<number>(0);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch categories when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.response.data);
        setTotalCount(response.response.data.length);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const rowIds = React.useMemo(() => {
    return categories.map((category) => category.id);
  }, [categories]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  // Reset selection when categories change
  React.useEffect(() => {
    if (selected.size > 0) {
      deselectAll();
    }
  }, [categories, deselectAll, selected.size]);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < categories.length;
  const selectedAll = categories.length > 0 && selected?.size === categories.length;

  const toggleExpandRow = (categoryId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle delete button click
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Handle confirmation dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);

      // Close dialog
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Category "${categoryToDelete.name}" deleted successfully`,
        severity: 'success',
      });

      // Trigger refresh either through callback or internal refresh
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        // Refresh the list internally
        const response = await categoryService.getAllCategories();
        setCategories(response.response.data);
        setTotalCount(response.response.data.length);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete category. It may have children categories.',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderCategoryRow = (category: Category, level = 0) => {
    const isSelected = selected?.has(category.id);
    const isExpanded = expandedRows[category.id];
    const hasChildren = category.children && category.children.length > 0;

    return (
      <React.Fragment key={category.id}>
        <TableRow hover selected={isSelected}>
          <TableCell padding="checkbox">
            <Checkbox
              checked={isSelected}
              onChange={(event) => {
                if (event.target.checked) {
                  selectOne(category.id);
                } else {
                  deselectOne(category.id);
                }
              }}
            />
          </TableCell>
          <TableCell>
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
              {hasChildren && (
                <IconButton size="small" onClick={() => toggleExpandRow(category.id)}>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </IconButton>
              )}
              <Box sx={{ ml: level * 2 }} />
              <Avatar src={category.attachment} variant="rounded" sx={{ width: 40, height: 40 }} />
              <Typography variant="subtitle2">{category.name}</Typography>
              {level > 0 && <Chip label="Child" size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />}
            </Stack>
          </TableCell>
          <TableCell>{category.description}</TableCell>
          <TableCell>
            <Chip label={category.status} color={category.status === 'Active' ? 'success' : 'error'} size="small" />
          </TableCell>
          <TableCell align="right">
            <Tooltip title={hasChildren ? 'Cannot delete category with children' : 'Delete category'}>
              <span>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDeleteClick(category)}
                  disabled={hasChildren}
                >
                  <Trash size={20} />
                </IconButton>
              </span>
            </Tooltip>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && (
          <TableRow>
            <TableCell colSpan={5} padding="none" sx={{ border: 0 }}>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ py: 1 }}>{category.children.map((child) => renderCategoryRow(child, level + 1))}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
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
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(event) => {
                      if (event.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" py={2}>
                      No categories found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => renderCategoryRow(category))
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
        <DialogTitle id="delete-dialog-title">Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
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

export default CategoryTable;
