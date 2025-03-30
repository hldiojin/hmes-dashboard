'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Snackbar, Tab, Tabs } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ClipboardText as AssignedIcon } from '@phosphor-icons/react/dist/ssr';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import TicketList from '@/components/dashboard/ticket/TicketList';

function Tickets(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const shouldRefresh = searchParams.get('refresh') === 'true';
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState(0);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Update activeTab from URL query parameter
  React.useEffect(() => {
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 2) {
        setActiveTab(tabIndex);
      }
    }
  }, [tabParam]);

  // Handle refresh parameter when coming back from ticket details
  React.useEffect(() => {
    if (shouldRefresh) {
      // Trigger a refresh by incrementing the trigger
      setRefreshTrigger((prev) => prev + 1);

      // Remove the refresh parameter from the URL without navigation
      const newUrl = `/dashboard/tickets${tabParam ? `?tab=${tabParam}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [shouldRefresh, tabParam]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Update URL with tab parameter without triggering a full navigation
    const newUrl = `/dashboard/tickets?tab=${newValue}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // Update active tab state
    setActiveTab(newValue);

    // Force refresh on tab change
    setRefreshTrigger(Date.now());
  };

  // Determine the API endpoint based on the active tab
  const getEndpoint = () => {
    const tabIndex = tabParam ? parseInt(tabParam, 10) : 0;

    switch (tabIndex) {
      case 1:
        return 'ticket/assigned';
      case 2:
        return 'ticket/transfer';
      default:
        return 'ticket';
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Tickets</Typography>
        </Stack>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="ticket navigation tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Tickets" />
          <Tab label="Assigned Tickets" />
          <Tab label="Transfer Requests" />
        </Tabs>
      </Box>

      <TicketList
        key={getEndpoint()}
        refreshTrigger={refreshTrigger}
        onRefreshNeeded={handleRefresh}
        endpoint={getEndpoint()}
      />

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
export default Tickets;
