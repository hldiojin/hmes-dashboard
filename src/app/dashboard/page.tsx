'use client';

import * as React from 'react';
import { Box, Container, Grid } from '@mui/material';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { OrderStatusChart } from '@/components/dashboard/overview/order-status-chart';
import { Sales } from '@/components/dashboard/overview/sales';
import { StatsOrderControl } from '@/components/dashboard/overview/stats-order-control';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

import { useOrderOverview } from '../../hooks/useOrderOverview';
import { useUserCount } from '../../hooks/useUserCount';

export default function DashboardPage() {
  const { data, loading, error, statsOrderCount, updateStatsOrderCount } = useOrderOverview();
  const { count: userCount, loading: userCountLoading } = useUserCount();

  // Extract monthly revenue data for the chart
  const monthlyRevenueData = React.useMemo(() => {
    if (!data?.revenueByDay) {
      return Array(12).fill(0);
    }

    return data.revenueByDay.map((item) => item.revenue / 1000000); // Convert to millions for display
  }, [data?.revenueByDay]);

  // Handle order count change
  const handleOrderCountChange = (count: number) => {
    updateStatsOrderCount(count);
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Budget widget showing total revenue */}
          <Grid item xs={12} sm={6} lg={3}>
            <Budget
              diff={12}
              trend="up"
              sx={{ height: '100%' }}
              value={
                data?.totalRevenue
                  ? data.totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                  : '0đ'
              }
            />
          </Grid>

          {/* Total customers widget */}
          <Grid item xs={12} sm={6} lg={3}>
            <TotalCustomers trend="up" diff={5} sx={{ height: '100%' }} value={userCount.toString()} />
          </Grid>

          {/* Total orders widget */}
          <Grid item xs={12} sm={6} lg={3}>
            <TotalProfit sx={{ height: '100%' }} value={(data?.totalOrders || 0).toString()} />
          </Grid>

          {/* Order Count Stats Control */}
          <Grid item xs={12} sm={6} lg={3}>
            <StatsOrderControl
              currentValue={statsOrderCount}
              onChange={handleOrderCountChange}
              isLoading={loading}
              sx={{ height: '100%' }}
            />
          </Grid>

          {/* Sales chart showing revenue by month */}
          <Grid item xs={12} md={8} lg={8}>
            <Sales
              chartSeries={[
                {
                  name: 'Doanh thu',
                  data: monthlyRevenueData,
                },
              ]}
              sx={{ height: '100%' }}
            />
          </Grid>

          {/* Order Status Pie Chart */}
          <Grid item xs={12} md={4} lg={4}>
            {data?.ordersByStatus && <OrderStatusChart statusData={data.ordersByStatus} sx={{ height: '100%' }} />}
          </Grid>

          {/* Latest orders table */}
          <Grid item xs={12} lg={12}>
            <LatestOrders orders={data?.latestOrders || []} sx={{ height: '100%' }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
