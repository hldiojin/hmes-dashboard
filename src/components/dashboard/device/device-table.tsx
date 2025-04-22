'use client';

import * as React from 'react';
import { deviceService } from '@/services/deviceService';
import { Device } from '@/types/device';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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
import { Info, NotePencil, TrashSimple } from '@phosphor-icons/react';

import { DeviceFilters } from './device-filters';

interface DeviceTableProps {
  refreshTrigger?: number;
  onViewDetails?: (device: Device) => void;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
}

export function DeviceTable({ 
  refreshTrigger = 0,
  onViewDetails,
  onEdit,
  onDelete
}: DeviceTableProps): React.JSX.Element {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState('');
  const [statusValue, setStatusValue] = React.useState('');

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceService.getDevices(
        page + 1,
        rowsPerPage,
        searchValue || undefined,
        statusValue || undefined
      );
      setDevices(response.response.data);
      setTotalItems(response.response.totalItems);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchDevices();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, rowsPerPage, searchValue, statusValue, refreshTrigger]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Hoạt động';
      case 'Inactive':
        return 'Không hoạt động';
      case 'Maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  if (loading && devices.length === 0) {
    return (
      <Card>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <DeviceFilters
        onSearchChange={setSearchValue}
        onStatusChange={setStatusValue}
        searchValue={searchValue}
        statusValue={statusValue}
      />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên thiết bị</TableCell>
              <TableCell>Số serial</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Nhà sản xuất</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow hover key={device.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {device.name}
                  </Typography>
                </TableCell>
                <TableCell>{device.serialNumber}</TableCell>
                <TableCell>{device.model}</TableCell>
                <TableCell>{device.manufacturer}</TableCell>
                <TableCell>{device.location || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(device.status)} 
                    color={getStatusColor(device.status) as "success" | "error" | "warning" | "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {onViewDetails && (
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          onClick={() => onViewDetails(device)}
                          color="primary"
                          size="small"
                        >
                          <Info size={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onEdit && (
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          onClick={() => onEdit(device)}
                          color="primary"
                          size="small"
                        >
                          <NotePencil size={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Xóa">
                        <IconButton
                          onClick={() => onDelete(device)}
                          color="error"
                          size="small"
                        >
                          <TrashSimple size={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalItems}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : 'hơn ' + to}`}
        />
      </Card>
    </Stack>
  );
} 