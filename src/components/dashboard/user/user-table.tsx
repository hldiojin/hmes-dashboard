'use client';

import * as React from 'react';
import { userService, type User } from '@/services/userService';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { UserFilters } from './user-filters';

interface UserTableProps {
  refreshTrigger?: number;
}

export function UserTable({ refreshTrigger = 0 }: UserTableProps): React.JSX.Element {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState('');
  const [statusValue, setStatusValue] = React.useState('');
  const [roleValue, setRoleValue] = React.useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(
        page + 1,
        rowsPerPage,
        searchValue || undefined,
        statusValue || undefined,
        roleValue || undefined
      );
      setUsers(response.response.data);
      setTotalItems(response.response.totalItems);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, rowsPerPage, searchValue, statusValue, roleValue, refreshTrigger]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
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
      <UserFilters
        onSearchChange={setSearchValue}
        onStatusChange={setStatusValue}
        onRoleChange={setRoleValue}
        searchValue={searchValue}
        statusValue={statusValue}
        roleValue={roleValue}
      />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Điện thoại</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow hover key={user.id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={user.attachment || '/assets/avatar.png'} />
                    <Typography variant="subtitle2">{user.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Typography color={user.status === 'Active' ? 'success.main' : 'error.main'} variant="body2">
                    {user.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Typography>
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
