'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { 
  getEmployeeIncomes, 
  deleteEmployeeIncome, 
  getAvailablePeriods,
  getIncomeStatsByDepartment
} from '../../../services/employeeIncomeService';
import { EmployeeIncome, PaymentStatus } from '../../../types/employee-income';

// Helper function to get status color
const getStatusColor = (status: PaymentStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Processed': return 'info';
    case 'Completed': return 'success';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export default function EmployeeIncomePage() {
  const router = useRouter();
  const [incomes, setIncomes] = useState<EmployeeIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [departmentStats, setDepartmentStats] = useState<{
    department: string;
    totalNet: number;
    employeeCount: number;
  }[]>([]);

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeIncomes({
          period: periodFilter || undefined,
          department: departmentFilter || undefined,
          paymentStatus: statusFilter || undefined
        });
        setIncomes(data);
        
        // Fetch periods for filter dropdown
        const periods = await getAvailablePeriods();
        setAvailablePeriods(periods);
        
        // Fetch department stats
        const stats = await getIncomeStatsByDepartment(periodFilter || undefined);
        setDepartmentStats(stats);
      } catch (error) {
        console.error('Failed to fetch income data:', error);
        setErrorMessage('Failed to load income records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncomes();
  }, [refreshTrigger, periodFilter, statusFilter, departmentFilter]);

  // Filter incomes based on search
  const filteredIncomes = incomes.filter(income => {
    if (keyword === '') return true;
    
    return (
      income.employeeName.toLowerCase().includes(keyword.toLowerCase()) ||
      income.employeeId.toLowerCase().includes(keyword.toLowerCase()) ||
      income.department.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  // Paginate the filtered incomes
  const paginatedIncomes = filteredIncomes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique departments for filter dropdown
  const departments = Array.from(new Set(incomes.map(income => income.department)));

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view income details
  const handleViewIncomeDetails = (incomeId: string) => {
    router.push(`/dashboard/employee-income/${incomeId}`);
  };

  // Handle create new income record
  const handleCreateIncome = () => {
    router.push('/dashboard/employee-income/create');
  };

  // Handle delete income
  const handleDeleteClick = (incomeId: string) => {
    const incomeRecord = incomes.find(inc => inc.id === incomeId);
    if (incomeRecord) {
      console.log(`Attempting to delete income record for: ${incomeRecord.employeeName}`);
      setIncomeToDelete(incomeId);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!incomeToDelete) return;
    
    console.log(`Confirming deletion of income record: ${incomeToDelete}`);
    setIsDeleting(true);
    
    try {
      const result = await deleteEmployeeIncome(incomeToDelete);
      console.log('Delete operation result:', result);
      
      if (result) {
        // Success - remove from local state
        setIncomes(prevIncomes => prevIncomes.filter(income => income.id !== incomeToDelete));
        setSuccessMessage('Income record deleted successfully');
        console.log('Income record deleted from state');
      } else {
        throw new Error('Delete operation returned false');
      }
    } catch (error) {
      console.error('Failed to delete income record:', error);
      setErrorMessage('Failed to delete income record. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setIncomeToDelete(null);
  };

  // Handle close alerts
  const handleCloseAlert = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const calculateTotalIncome = (statusFilter: PaymentStatus | '') => {
    return filteredIncomes
      .filter(income => statusFilter === '' || income.paymentStatus === statusFilter)
      .reduce((sum, income) => sum + income.netIncome, 0);
  };

  const getStatusCount = (status: PaymentStatus) => {
    return filteredIncomes.filter(income => income.paymentStatus === status).length;
  };

  if (loading && incomes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4} sx={{ mb: 3 }}>
        <Typography variant="h4">Employee Income Management</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleCreateIncome}
        >
          Create Income Record
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">
                Total Net Income ({filteredIncomes.length} records)
              </Typography>
              <Typography variant="h4">
                ${calculateTotalIncome('').toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">
                Pending Records
              </Typography>
              <Typography variant="h4" color="warning.main">
                {getStatusCount('Pending')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">
                Processed Records
              </Typography>
              <Typography variant="h4" color="info.main">
                {getStatusCount('Processed')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">
                Completed Records
              </Typography>
              <Typography variant="h4" color="success.main">
                {getStatusCount('Completed')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Department Summary */}
      {periodFilter && departmentStats.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Summary for {periodFilter}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Employee Count</TableCell>
                    <TableCell align="right">Total Net Income</TableCell>
                    <TableCell align="right">Average per Employee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentStats.map((stat) => (
                    <TableRow key={stat.department} hover>
                      <TableCell>{stat.department}</TableCell>
                      <TableCell align="right">{stat.employeeCount}</TableCell>
                      <TableCell align="right">${stat.totalNet.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        ${(stat.totalNet / stat.employeeCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Employee"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Name, ID"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="period-filter-label">Period</InputLabel>
                  <Select
                    labelId="period-filter-label"
                    value={periodFilter}
                    label="Period"
                    onChange={(e) => {
                      setPeriodFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Periods</MenuItem>
                    {availablePeriods.map((period) => (
                      <MenuItem key={period} value={period}>{period}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="department-filter-label">Department</InputLabel>
                  <Select
                    labelId="department-filter-label"
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value as PaymentStatus | '');
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processed">Processed</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    sx={{ mr: 1 }}
                  >
                    Search
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleRefresh}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Income Records Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Period</TableCell>
                <TableCell align="right">Base Salary</TableCell>
                <TableCell align="right">Add. Income</TableCell>
                <TableCell align="right">Deductions</TableCell>
                <TableCell align="right">Net Income</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedIncomes.length > 0 ? (
                paginatedIncomes.map((income) => (
                  <TableRow key={income.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {income.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {income.employeeId} • {income.employeeRole}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{income.department}</TableCell>
                    <TableCell>{income.period}</TableCell>
                    <TableCell align="right">${income.baseSalary.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      ${(income.totalIncome - income.baseSalary).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">${income.totalDeductions.toLocaleString()}</TableCell>
                    <TableCell align="right">${income.netIncome.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={income.paymentStatus}
                        color={getStatusColor(income.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewIncomeDetails(income.id)}
                        >
                          View
                        </Button>
                        {income.paymentStatus === 'Pending' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(income.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1">
                      {keyword || periodFilter || departmentFilter || statusFilter 
                        ? 'No matching income records found' 
                        : 'No income records found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredIncomes.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Income Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this income record? This action cannot be undone.
            {incomeToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" component="div">
                  Employee: {incomes.find(inc => inc.id === incomeToDelete)?.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Period: {incomes.find(inc => inc.id === incomeToDelete)?.period}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {incomes.find(inc => inc.id === incomeToDelete)?.paymentStatus}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}