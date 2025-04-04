'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import PaidIcon from '@mui/icons-material/Paid';
import CancelIcon from '@mui/icons-material/Cancel';
import { EmployeeIncome, PaymentStatus } from '../../../../types/employee-income';
import { getEmployeeIncomeById, updatePaymentStatus } from '../../../../services/employeeIncomeService';

const getStatusColor = (status: PaymentStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Processed': return 'info';
    case 'Completed': return 'success';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export default function IncomeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [incomeRecord, setIncomeRecord] = useState<EmployeeIncome & { paymentStatus: PaymentStatus } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PaymentStatus | null>(null);
  const incomeId = params.id;

  useEffect(() => {
    const loadIncomeDetails = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeIncomeById(incomeId);
        setIncomeRecord(data);
      } catch (error) {
        console.error('Failed to fetch income details:', error);
        setErrorMessage('Failed to load income record. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (incomeId) {
      loadIncomeDetails();
    }
  }, [incomeId]);

  const handleUpdateStatus = (status: PaymentStatus) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!incomeRecord || !newStatus) return;

    setUpdating(true);
    setStatusDialogOpen(false);

    try {
      const updatedRecord = await updatePaymentStatus(incomeRecord.id, newStatus);
      setIncomeRecord(updatedRecord);
      setSuccessMessage(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setErrorMessage('Failed to update payment status. Please try again.');
    } finally {
      setUpdating(false);
      setNewStatus(null);
    }
  };

  const handleCancelStatusUpdate = () => {
    setStatusDialogOpen(false);
    setNewStatus(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditRecord = () => {
    router.push(`/dashboard/employee-income/${incomeId}/edit`);
  };

  const handleCloseAlert = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!incomeRecord) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/employee-income')}
          sx={{ mb: 3 }}
        >
          Back to Income Records
        </Button>
        <Alert severity="error">Income record not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} className="print-section">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/employee-income')}
          sx={{ display: { xs: 'none', sm: 'flex' }, '@media print': { display: 'none' } }}
        >
          Back to Income Records
        </Button>
        <Typography variant="h4" sx={{ flex: 1, ml: { xs: 0, sm: 2 } }}>
          Income Statement - {incomeRecord.period}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, '@media print': { display: 'none' } }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          {incomeRecord.paymentStatus === 'Pending' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditRecord}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3, '@media print': { boxShadow: 'none', border: '1px solid #eee' } }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2 }}>
            <Typography variant="h5">
              {incomeRecord.employeeName}
            </Typography>
            <Chip
              label={incomeRecord.paymentStatus}
              color={getStatusColor(incomeRecord.paymentStatus)}
              sx={{ mt: { xs: 1, sm: 0 } }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Employee Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1">{incomeRecord.employeeId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Job Title</Typography>
                      <Typography variant="body1">{incomeRecord.employeeRole}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body1">{incomeRecord.department}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Pay Period</Typography>
                      <Typography variant="body1">{incomeRecord.period}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Payment Method"
                        secondary={incomeRecord.paymentMethod}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Payment Status"
                        secondary={incomeRecord.paymentStatus}
                      />
                    </ListItem>
                    {incomeRecord.paymentDate && (
                      <ListItem>
                        <ListItemText
                          primary="Payment Date"
                          secondary={new Date(incomeRecord.paymentDate).toLocaleDateString()}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {incomeRecord.paymentStatus !== 'Completed' && incomeRecord.paymentStatus !== 'Cancelled' && (
            <Box sx={{ mt: 3, '@media print': { display: 'none' } }}>
              <Stack direction="row" spacing={2}>
                {incomeRecord.paymentStatus === 'Pending' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateStatus('Processed')}
                    disabled={updating}
                  >
                    Mark as Processed
                  </Button>
                )}
                {incomeRecord.paymentStatus === 'Processed' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PaidIcon />}
                    onClick={() => handleUpdateStatus('Completed')}
                    disabled={updating}
                  >
                    Mark as Completed
                  </Button>
                )}
                {(incomeRecord.paymentStatus as PaymentStatus) !== 'Cancelled' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleUpdateStatus('Cancelled')}
                    disabled={updating}
                  >
                    Cancel Payment
                  </Button>
                )}
                {updating && <CircularProgress size={24} />}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #eee' } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Earnings</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Salary</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="right">${incomeRecord.baseSalary.toLocaleString()}</TableCell>
                    </TableRow>
                    {incomeRecord.incomeItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.type} - {item.description}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total Earnings</Typography>
                <Typography variant="subtitle1">${incomeRecord.totalIncome.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #eee' } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Deductions</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incomeRecord.deductionItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.type} - {item.description}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {incomeRecord.deductionItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No deductions</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total Deductions</Typography>
                <Typography variant="subtitle1">${incomeRecord.totalDeductions.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #eee' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Net Pay</Typography>
                <Typography variant="h4" color="primary.main">
                  ${incomeRecord.netIncome.toLocaleString()}
                </Typography>
              </Box>

              {incomeRecord.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography variant="body2">{incomeRecord.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCancelStatusUpdate}
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the payment status to <strong>{newStatus}</strong>?
            {newStatus === 'Completed' && ' This will mark the payment as completed and set the payment date to today.'}
            {newStatus === 'Cancelled' && ' This will cancel the payment process.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusUpdate}>Cancel</Button>
          <Button
            onClick={handleConfirmStatusUpdate}
            color={newStatus === 'Cancelled' ? 'error' : 'primary'}
            variant="contained"
          >
            Confirm
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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Box>
  );
}