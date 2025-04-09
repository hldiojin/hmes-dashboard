'use client';

import * as React from 'react';
import { Box, Container, Grid } from '@mui/material';
import dayjs from 'dayjs';

import { config } from '@/config';
import { useOrderOverview } from '../../hooks/useOrderOverview';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

export default function DashboardPage() {
  const { data, loading, error } = useOrderOverview();

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Budget widget showing total revenue */}
          <Grid item xs={12} sm={6} lg={3}>
            <Budget 
              difference={12} // You might calculate this as percentage change
              positive 
              sx={{ height: '100%' }} 
              value={data?.totalRevenue || 0} 
            />
          </Grid>

          {/* Total customers widget */}
          <Grid item xs={12} sm={6} lg={3}>
            <TotalCustomers 
              trend="up" 
              sx={{ height: '100%' }} 
              value={(data?.totalOrders || 0).toString()}
            />
          </Grid>

          {/* Add other metric widgets as needed */}
          
          {/* Sales chart showing revenue by day */}
          <Grid item xs={12} lg={8}>
            {data?.revenueByDay && (
              <Sales
                chartSeries={[
                  {
                    name: 'This year',
                    data: data.revenueByDay.map(item => item.revenue),
                  },
                ]}
                sx={{ height: '100%' }}
              />
            )}
          </Grid>

          {/* Latest orders table */}
          <Grid item xs={12} lg={12}>
            <LatestOrders
              orders={data?.latestOrders || []}
              sx={{ height: '100%' }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
