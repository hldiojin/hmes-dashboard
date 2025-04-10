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
import { CaretDown as ChevronDown, CaretRight as ChevronRight, PencilSimple, Trash } from '@phosphor-icons/react';

import { Category } from '@/types/category';
import { useSelection } from '@/hooks/use-selection';

import CategoryModal from './category-modal';

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

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(null);

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

  // Handle row click for edit
  const handleRowClick = (category: Category) => {
    setCategoryToEdit(category);
    setEditModalOpen(true);
  };

  // Handle edit modal close
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCategoryToEdit(null);
  };

  // Handle edit submit
  const handleEditSubmit = async (formData: FormData) => {
    if (!categoryToEdit) return;

    try {
      await categoryService.updateCategory(categoryToEdit.id, formData);

      // Show success message
      setSnackbar({
        open: true,
        message: `Category "${categoryToEdit.name}" updated successfully`,
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
      console.error('Error updating category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update category',
        severity: 'error',
      });
    }
  };

  const renderCategoryRow = (category: Category, level = 0) => {
    const isSelected = selected?.has(category.id);
    const isExpanded = expandedRows[category.id];
    const hasChildren = category.children && category.children.length > 0;

    return (
      <React.Fragment key={category.id}>
        <TableRow
          hover
          selected={isSelected}
          sx={{
            '& td': { py: 1.5 },
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            ...(isSelected && {
              backgroundColor: 'action.selected',
            }),
            transition: 'background-color 0.2s ease',
          }}
        >
          <TableCell>{category.id.slice(0, 8)}...</TableCell>
          <TableCell>
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={() => toggleExpandRow(category.id)}
                  sx={{
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.lighter' },
                    transition: 'all 0.2s',
                  }}
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </IconButton>
              )}
              <Box sx={{ ml: level * 2 }} />
              <Avatar
                src={category.attachment}
                variant="rounded"
                sx={{
                  width: 40,
                  height: 40,
                  boxShadow: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  ...(level > 0 && { color: 'primary.main' }),
                }}
              >
                {category.name}
              </Typography>
              {level > 0 && (
                <Chip
                  label="Child"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          </TableCell>
          <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {category.description}
          </TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <Chip
              label={category.status}
              color={category.status === 'Active' ? 'success' : 'error'}
              size="small"
              sx={{
                fontWeight: 500,
                borderRadius: '6px',
                px: 1,
                fontSize: '0.75rem',
              }}
            />
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Edit category">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleRowClick(category)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.light',
                    '&:hover': { backgroundColor: 'primary.lighter' },
                    transition: 'all 0.2s',
                  }}
                >
                  <PencilSimple size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title={hasChildren ? 'Cannot delete category with children' : 'Delete category'}>
                <span>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDeleteClick(category)}
                    disabled={hasChildren}
                    sx={{
                      border: '1px solid',
                      borderColor: 'error.light',
                      '&:hover': { backgroundColor: 'error.lighter' },
                      '&.Mui-disabled': {
                        borderColor: 'action.disabledBackground',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Trash size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && (
          <TableRow>
            <TableCell colSpan={5} padding="none" sx={{ border: 0 }}>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    py: 1,
                    borderLeft: '2px solid',
                    borderColor: 'primary.lighter',
                    ml: 4,
                    '& .MuiTableRow-root': {
                      '& .MuiTableCell-root:nth-of-type(4)': {
                        // Status column
                        width: '1%', // Force width to match parent rows
                        whiteSpace: 'nowrap',
                      },
                      '& .MuiTableCell-root:nth-of-type(5)': {
                        // Actions column
                        textAlign: 'right',
                        width: '1%',
                      },
                    },
                  }}
                >
                  {category.children.map((child) => renderCategoryRow(child, level + 1))}
                </Box>
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
              <TableRow
                sx={{
                  backgroundColor: 'background.paper',
                  '& th': {
                    fontWeight: 'bold',
                    color: 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                  },
                }}
              >
                <TableCell width="12%">ID</TableCell>
                <TableCell width="30%">Name</TableCell>
                <TableCell width="40%">Description</TableCell>
                <TableCell width="8%">Status</TableCell>
                <TableCell width="10%" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
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

      {/* Edit Modal */}
      <CategoryModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        category={categoryToEdit || undefined}
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

export default CategoryTable;
