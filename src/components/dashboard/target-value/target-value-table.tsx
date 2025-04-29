'use client';

import * as React from 'react';
import { Alert, Snackbar } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
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

import TargetValueModal from '@/components/dashboard/target-value/target-value-modal';

import { useSelection } from '../../../hooks/use-selection';
import targetValueService from '../../../services/targetValueService';
import { TargetValue, ValueType, ValueTypeEnums } from '../../../types/targetValue';

function noop(): void {
  // do nothing
}

interface TargetValueTableProps {
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
  type?: ValueType | null;
  minValue?: number | null;
  maxValue?: number | null;
  onRowClick?: (targetValueId: string) => void;
}

function TargetValueTable({
  count = 0,
  page = 0,
  rowsPerPage = 10,
  refreshTrigger = 0,
  onRefreshNeeded,
  type = null,
  minValue = null,
  maxValue = null,
  onRowClick,
}: TargetValueTableProps): React.JSX.Element {
  const [targetValues, setTargetValues] = React.useState<TargetValue[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [targetValueToDelete, setTargetValueToDelete] = React.useState<TargetValue | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [targetValueToEdit, setTargetValueToEdit] = React.useState<TargetValue | null>(null);
  const [editLoading, setEditLoading] = React.useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch target values from API
  const fetchTargetValues = React.useCallback(async () => {
    setLoading(true);

    console.log('Đang tải dữ liệu giá trị mục tiêu với:', {
      type,
      minValue,
      maxValue,
      currentPage,
      rowsPerPage,
    });

    try {
      const response = await targetValueService.getAllTargetValues(type, minValue, maxValue, currentPage, rowsPerPage);

      if (response.response && Array.isArray(response.response.data)) {
        console.log('Đã tải giá trị mục tiêu thành công:', response.response.data);
        setTargetValues(response.response.data);
        setTotalCount(response.response.totalItems);
        setCurrentPage(response.response.currentPage);
        setTotalPages(response.response.totalPages);
      } else {
        console.error('Không đúng định dạng phản hồi:', response);
        setTargetValues([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Không thể tải giá trị mục tiêu:', error);
      setTargetValues([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, maxValue, minValue, rowsPerPage, type]);

  // Effect to fetch data when dependencies change
  React.useEffect(() => {
    fetchTargetValues();
  }, [fetchTargetValues, refreshTrigger]);

  // Effect to reset to first page when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger > 0) {
      setCurrentPage(1);
    }
  }, [refreshTrigger]);

  const rowIds = React.useMemo(() => {
    return targetValues.map((targetValue) => targetValue.id);
  }, [targetValues]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  // Reset selection when target values change
  React.useEffect(() => {
    if (selected.size > 0) {
      deselectAll();
    }
  }, [targetValues, deselectAll, selected.size]);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < targetValues.length;
  const selectedAll = targetValues.length > 0 && selected?.size === targetValues.length;

  // Handle delete button click
  const handleDeleteClick = (targetValue: TargetValue) => {
    setTargetValueToDelete(targetValue);
    setDeleteDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (targetValue: TargetValue) => {
    setTargetValueToEdit(targetValue);
    setEditModalOpen(true);
  };

  // Handle confirmation dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTargetValueToDelete(null);
  };

  // Handle edit modal close
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setTargetValueToEdit(null);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!targetValueToDelete) return;

    setDeleteLoading(true);
    try {
      await targetValueService.deleteTargetValue(targetValueToDelete.id);
      console.log('Đã xóa giá trị mục tiêu thành công');

      // Close dialog
      setDeleteDialogOpen(false);
      setTargetValueToDelete(null);

      // Show success message
      setSnackbar({
        open: true,
        message: `Đã xóa giá trị mục tiêu thành công`,
        severity: 'success',
      });

      // Refresh the data
      if (onRefreshNeeded) {
        onRefreshNeeded();
      } else {
        fetchTargetValues();
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa giá trị mục tiêu:', error);

      // Extract error message from response if available
      let errorMessage = 'Không thể xóa giá trị mục tiêu';
      if (error.response?.data?.response?.message) {
        errorMessage = error.response.data.response.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
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

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
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

  // Get target type display name
  const getTargetTypeDisplayName = (type: ValueType): string => {
    switch (type) {
      case 'Temperature':
        return 'Nhiệt độ nước';
      case 'SoluteConcentration':
        return 'Nồng độ dung dịch';
      case 'WaterLevel':
        return 'Mực nước';
      case 'Ph':
        return 'pH';
      default:
        return type;
    }
  };

  // Get target type unit
  const getTargetTypeUnit = (type: ValueType): string => {
    switch (type) {
      case 'Temperature':
        return '°C';
      case 'SoluteConcentration':
        return 'ppm';
      case 'WaterLevel':
        return 'cm';
      case 'Ph':
        return '';
      default:
        return '';
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
                <TableCell>Loại</TableCell>
                <TableCell>Giá trị tối thiểu</TableCell>
                <TableCell>Giá trị tối đa</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : targetValues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" py={2}>
                      Không tìm thấy giá trị mục tiêu nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                targetValues.map((targetValue) => {
                  const isSelected = selected?.has(targetValue.id);
                  return (
                    <TableRow
                      hover
                      selected={isSelected}
                      key={targetValue.id}
                      onClick={() => onRowClick?.(targetValue.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{targetValue.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {getTargetTypeDisplayName(targetValue.type as ValueType)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {targetValue.minValue ?? '-'} {getTargetTypeUnit(targetValue.type as ValueType)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {targetValue.maxValue ?? '-'} {getTargetTypeUnit(targetValue.type as ValueType)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Chỉnh sửa giá trị mục tiêu">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditClick(targetValue);
                              }}
                            >
                              <PencilSimple size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa giá trị mục tiêu">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteClick(targetValue);
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
        <DialogTitle id="delete-dialog-title">Xóa giá trị mục tiêu</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa giá trị mục tiêu này? Hành động này không thể hoàn tác.
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
      <TargetValueModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={() => {
          // Refresh the list after successful edit
          if (onRefreshNeeded) {
            onRefreshNeeded();
          } else {
            fetchTargetValues();
          }
        }}
        targetValue={targetValueToEdit}
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

export default TargetValueTable;
