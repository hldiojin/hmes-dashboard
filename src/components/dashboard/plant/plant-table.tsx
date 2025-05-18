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
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
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
  onPageChange,
  onRowsPerPageChange,
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

  React.useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        // Luôn sắp xếp với các sản phẩm mới tạo ở đầu bảng (sắp xếp theo createdAt giảm dần)
        const response = await plantService.getAllPlants(keyword, status, page + 1, rowsPerPage, 'createdAt', 'desc');
        setPlants(response.response.data);
        setTotalCount(response.response.totalItems);
        setCurrentPage(response.response.currentPage);
        setTotalPages(response.response.totalPages);
      } catch (error) {
        console.error('Lỗi khi tải danh sách cây trồng:', error);
        setPlants([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [refreshTrigger, page, rowsPerPage, keyword, status]);

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
        message: `Cây trồng "${plantToDelete.name}" đã xóa thành công`,
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
      console.error('Lỗi khi xóa cây trồng:', error);
      setSnackbar({
        open: true,
        message: 'Không thể xóa cây trồng',
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
        message: `Cây trồng "${plantToEdit.name}" đã được cập nhật thành công`,
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
      console.error('Lỗi khi cập nhật cây trồng:', error);
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật cây trồng',
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
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setCurrentPage(1);
      // Note: rowsPerPage is a prop, so we need a callback
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
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
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body1" py={2}>
                      Không tìm thấy cây trồng nào
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
                      <TableCell>{plant.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{plant.name}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Chỉnh sửa cây trồng">
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
                          <Tooltip title="Xóa cây trồng">
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
        <DialogTitle id="delete-dialog-title">Xóa cây trồng</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa cây trồng "{plantToDelete?.name}"? Hành động này không thể hoàn tác.
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
