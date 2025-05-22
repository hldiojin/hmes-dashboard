'use client';

import * as React from 'react';
import { deviceService } from '@/services/deviceService';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import parse from 'html-react-parser';
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

import { Device } from '@/types/device';

import { DeviceFilters } from './device-filters';
import { EditDeviceModal } from './edit-device-modal';

// Helper function to format rich text content
const formatRichTextContent = (content: string) => {
  try {
    const contentObj = JSON.parse(content);
    if (!contentObj.blocks || !Array.isArray(contentObj.blocks)) {
      return content;
    }

    // Create formatted HTML from the rich text structure
    return (
      <Box>
        {contentObj.blocks.map((block: any, index: number) => {
          // Handle different block types
          let blockStyle = { my: 0.5 };
          let listItemPrefix = '';

          if (block.type === 'ordered-list-item') {
            listItemPrefix = `${index + 1}. `;
          } else if (block.type === 'unordered-list-item') {
            listItemPrefix = '• ';
          }

          // Special styles for block types
          const getBlockStyle = () => {
            if (block.type === 'blockquote') {
              return {
                ...blockStyle,
                pl: 2,
                borderLeft: '4px solid',
                borderColor: 'divider',
              };
            }
            if (block.type === 'header-one') {
              return { ...blockStyle, fontSize: '1.5rem', fontWeight: 'bold' };
            }
            if (block.type === 'header-two') {
              return { ...blockStyle, fontSize: '1.25rem', fontWeight: 'bold' };
            }
            if (block.type === 'header-three') {
              return { ...blockStyle, fontSize: '1.1rem', fontWeight: 'bold' };
            }
            return blockStyle;
          };

          // Process inline style ranges
          const text = block.text;
          if (!block.inlineStyleRanges || block.inlineStyleRanges.length === 0) {
            return (
              <Typography key={block.key || index} sx={getBlockStyle()} component="div">
                {listItemPrefix}
                {text}
              </Typography>
            );
          }

          // Sort inline style ranges by offset
          const sortedRanges = [...block.inlineStyleRanges].sort((a, b) => a.offset - b.offset);

          // Create text segments with styles
          const segments: JSX.Element[] = [];
          let lastIndex = 0;

          sortedRanges.forEach((range, i) => {
            // Add text before this style range
            if (range.offset > lastIndex) {
              segments.push(
                <React.Fragment key={`${block.key}-before-${i}`}>{text.slice(lastIndex, range.offset)}</React.Fragment>
              );
            }

            // Add styled text
            const styledText = text.slice(range.offset, range.offset + range.length);
            const style: React.CSSProperties = {};

            if (range.style === 'BOLD') {
              style.fontWeight = 'bold';
            } else if (range.style === 'ITALIC') {
              style.fontStyle = 'italic';
            } else if (range.style === 'UNDERLINE') {
              style.textDecoration = 'underline';
            } else if (range.style === 'STRIKETHROUGH') {
              style.textDecoration = 'line-through';
            }

            segments.push(
              <span key={`${block.key}-style-${i}`} style={style}>
                {styledText}
              </span>
            );

            lastIndex = range.offset + range.length;
          });

          // Add remaining text after the last style range
          if (lastIndex < text.length) {
            segments.push(<React.Fragment key={`${block.key}-after`}>{text.slice(lastIndex)}</React.Fragment>);
          }

          return (
            <Typography key={block.key || index} sx={getBlockStyle()} component="div">
              {listItemPrefix}
              {segments}
            </Typography>
          );
        })}
      </Box>
    );
  } catch (e) {
    // If not valid JSON or any error occurs, return the raw text
    return content;
  }
};

interface DeviceTableProps {
  refreshTrigger?: number;
  onViewDetails?: (device: Device) => void;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
}

export default function DeviceTable({
  refreshTrigger = 0,
  onViewDetails,
  onEdit,
  onDelete,
}: DeviceTableProps): React.JSX.Element {
  const [allDevices, setAllDevices] = React.useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceService.getDevices(page + 1, rowsPerPage);
      const devices = response.response.data;
      setAllDevices(devices);
      setFilteredDevices(devices);
      setTotalItems(response.response.totalItems);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDevices();
  }, [refreshTrigger]);

  // Apply search filter
  React.useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredDevices(allDevices);
      return;
    }

    const lowercasedSearch = searchValue.toLowerCase();
    const filtered = allDevices.filter(
      (device) =>
        device.name.toLowerCase().includes(lowercasedSearch) ||
        (device.description && device.description.toLowerCase().includes(lowercasedSearch))
    );

    setFilteredDevices(filtered);
    // Reset to first page when searching
    setPage(0);
  }, [searchValue, allDevices]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
    if (onEdit) {
      onEdit(device);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedDevice(null);
    fetchDevices();
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedDevice(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  if (loading && filteredDevices.length === 0) {
    return (
      <Card>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  // Calculate pagination for client-side
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

  return (
    <Stack spacing={3}>
      <DeviceFilters onSearchChange={handleSearchChange} searchValue={searchValue} />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên thiết bị</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDevices.length > 0 ? (
              paginatedDevices.map((device) => (
                <TableRow hover key={device.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{device.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {device.attachment && (
                      <Box
                        component="img"
                        src={device.attachment}
                        alt={device.name}
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {/* {device.description
                      ? typeof device.description === 'string' && device.description.startsWith('{')
                        ? formatRichTextContent(device.description)
                        : device.description
                      : 'N/A'} */}
                    {device.description ? parse(device.description) : 'N/A'}
                  </TableCell>
                  <TableCell>{device.price.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell>{device.quantity}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {onViewDetails && (
                        <Tooltip title="Xem chi tiết">
                          <IconButton onClick={() => onViewDetails(device)} color="primary" size="small">
                            <Info size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => handleEditClick(device)} color="primary" size="small">
                          <NotePencil size={20} />
                        </IconButton>
                      </Tooltip>
                      {onDelete && (
                        <Tooltip title="Xóa">
                          <IconButton onClick={() => onDelete(device)} color="error" size="small">
                            <TrashSimple size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Không tìm thấy thiết bị nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredDevices.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : 'hơn ' + to}`}
        />
      </Card>

      {selectedDevice && (
        <EditDeviceModal
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          onSuccess={handleEditSuccess}
          device={selectedDevice}
        />
      )}
    </Stack>
  );
}
