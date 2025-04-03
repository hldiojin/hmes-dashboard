'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createTicket } from '@/services/ticketService';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { Ticket, TicketStatus, TicketType } from '@/types/ticket';

function CreateTicket(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    briefDescription: '',
    description: '',
    type: TicketType.Shopping,
    status: TicketStatus.Pending,
    handledBy: '',
  });
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      await createTicket(formData as Partial<Ticket>);
      setSnackbar({
        open: true,
        message: 'Ticket created successfully',
        severity: 'success',
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/tickets');
      }, 1500);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create ticket',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          color="inherit"
          startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
          onClick={() => router.push('/dashboard/tickets')}
        >
          Back
        </Button>
        <Typography variant="h4">Create Ticket</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="briefDescription"
                label="Brief Description"
                name="briefDescription"
                multiline
                rows={4}
                value={formData.briefDescription}
                onChange={handleTextChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                label="Detailed Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleTextChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  label="Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={TicketType.Shopping}>{TicketType.Shopping}</MenuItem>
                  <MenuItem value={TicketType.Technical}>{TicketType.Technical}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={TicketStatus.Pending}>Pending</MenuItem>
                  <MenuItem value={TicketStatus.InProgress}>In Progress</MenuItem>
                  <MenuItem value={TicketStatus.Done}>Done</MenuItem>
                  <MenuItem value={TicketStatus.Closed}>Closed</MenuItem>
                  <MenuItem value={TicketStatus.IsTransferring}>Is Transferring</MenuItem>
                  <MenuItem value={TicketStatus.TransferRejected}>Transfer Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="handledBy"
                label="Handled By"
                name="handledBy"
                value={formData.handledBy}
                onChange={handleTextChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit" disabled={loading} sx={{ mt: 3, mb: 2 }}>
                  {loading ? <CircularProgress size={24} /> : 'Create Ticket'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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
    </Stack>
  );
}

export default CreateTicket;
