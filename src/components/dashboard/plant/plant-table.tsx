'use client';

import * as React from 'react';
import { Alert, Snackbar } from '@mui/material';
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

import PlantModal from '@/components/dashboard/plant/plant-modal';

import { useSelection } from '../../../hooks/use-selection';
import plantService from '../../../services/plantService';
import { Plant } from '../../../types/plant';

function noop(): void {
  // do nothing
}

interface PlantTableProps {
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
  keyword?: string;
  status?: 'Active' | 'Inactive' | null;
  onRowClick?: (plantId: string) => void;
}

function PlantTable({
  count = 0,
  page = 0,
  rowsPerPage = 10,
  refreshTrigger = 0,
  onRefreshNeeded,
  keyword = '',
  status = null,
  onRowClick,
}: PlantTableProps): React.JSX.Element {
  const [plants, setPlants] = React.useState<Plant[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [plantToDelete, setPlantToDelete] = React.useState<Plant | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [plantToEdit, setPlantToEdit] = React.useState<Plant | null>(null);
  const [editLoading, setEditLoading] = React.useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch plants when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const response = await plantService.getAllPlants(keyword, status, currentPage, rowsPerPage);
        setPlants(response.response.data);
        setTotalCount(response.response.totalItems);
        setCurrentPage(response.response.currentPage);
        setTotalPages(response.response.totalPages);
      } catch (error) {
        console.error('Failed to fetch plants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [refreshTrigger, currentPage, rowsPerPage]);

  const rowIds = React.useMemo(() => {
    return plants.map((plant) => plant.id);
  }, [plants]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  // Reset selection when plants change
  React.useEffect(() => {
    if (selected.size > 0) {
      deselectAll();
    }
  }, [plants, deselectAll, selected.size]);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < plants.length;
  const selectedAll = plants.length > 0 && selected?.size === plants.length;

  // Handle delete button click
  const handleDeleteClick = (plant: Plant) => {
    setPlantToDelete(plant);
    setDeleteDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (plant: Plant) => {
    setPlantToEdit(plant);
    setEditModalOpen(true);
  };

  // Handle confirmation dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPlantToDelete(null);
  };

  // Handle edit modal close
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setPlantToEdit(null);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!plantToDelete) return;

    setDeleteLoading(true);
    try {
      await plantService.deletePlant(plantToDelete.id);

      // Close dialog
      setDeleteDialogOpen(false);
      setPlantToDelete(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Plant "${plantToDelete.name}" deleted successfully`,
        severity: 'success',
      });

      // Trigger refresh either through callback or internal refresh
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        // Refresh the list internally
        const response = await plantService.getAllPlants(keyword, status, currentPage, rowsPerPage);
        setPlants(response.response.data);
        setTotalCount(response.response.totalItems);
        setCurrentPage(response.response.currentPage);
        setTotalPages(response.response.totalPages);
      }
    } catch (error) {
      console.error('Error deleting plant:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete plant',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (name: string, status: 'Active' | 'Inactive') => {
    if (!plantToEdit) return;

    setEditLoading(true);
    try {
      await plantService.updatePlant(plantToEdit.id, name, status);

      // Close modal
      setEditModalOpen(false);
      setPlantToEdit(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Plant "${plantToEdit.name}" updated successfully`,
        severity: 'success',
      });

      // Trigger refresh either through callback or internal refresh
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        // Refresh the list internally
        const response = await plantService.getAllPlants(keyword, status, currentPage, rowsPerPage);
        setPlants(response.response.data);
        setTotalCount(response.response.totalItems);
        setCurrentPage(response.response.currentPage);
        setTotalPages(response.response.totalPages);
      }
    } catch (error) {
      console.error('Error updating plant:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update plant',
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

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setCurrentPage(1);
    // Note: rowsPerPage is a prop, so we need to handle this through a callback
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
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
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" py={2}>
                      No plants found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                plants.map((plant) => {
                  const isSelected = selected?.has(plant.id);
                  return (
                    <TableRow
                      hover
                      selected={isSelected}
                      key={plant.id}
                      onClick={() => onRowClick?.(plant.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(event) => {
                            event.stopPropagation();
                            if (event.target.checked) {
                              selectOne(plant.id);
                            } else {
                              deselectOne(plant.id);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{plant.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={plant.status}
                          color={plant.status === 'Active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit plant">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditClick(plant);
                              }}
                            >
                              <PencilSimple size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete plant">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteClick(plant);
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
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={currentPage - 1}
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
        <DialogTitle id="delete-dialog-title">Delete Plant</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the plant "{plantToDelete?.name}"? This action cannot be undone.
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
      <PlantModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        plant={plantToEdit || undefined}
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

export default PlantTable;
