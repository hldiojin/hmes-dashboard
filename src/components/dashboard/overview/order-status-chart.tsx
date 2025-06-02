'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export interface OrderStatusChartProps {
  statusData: Array<{ status: string; count: number }>;
  sx?: SxProps;
}

// Status translation mapping
const statusTranslations: Record<string, string> = {
  Pending: 'Chờ xử lý',
  PendingPayment: 'Chờ thanh toán',
  IsWaiting: 'Chờ xác nhận',
  AllowRepayment: 'Cho phép thanh toán lại',
  Delivering: 'Đang giao hàng',
  Success: 'Thành công',
  Cancelled: 'Đã hủy',
};

export function OrderStatusChart({ statusData, sx }: OrderStatusChartProps): React.JSX.Element {
  const theme = useTheme();

  // Transform data for the pie chart
  const chartSeries = statusData.map((item) => item.count);

  // Get English labels and translate to Vietnamese
  const englishLabels = statusData.map((item) => item.status);
  const vietnameseLabels = englishLabels.map((status) => statusTranslations[status] || status);

  // Define custom colors for statuses
  const statusColors = {
    Pending: theme.palette.warning.main,
    PendingPayment: theme.palette.info.main,
    IsWaiting: theme.palette.warning.main,
    AllowRepayment: theme.palette.secondary.main,
    Delivering: theme.palette.info.main,
    Success: theme.palette.success.main,
    Cancelled: theme.palette.error.main,
  };

  // Get colors array in the same order as the labels
  const colors = englishLabels.map((label) => {
    return statusColors[label as keyof typeof statusColors] || theme.palette.primary.main;
  });

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: colors,
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        // Show percentage
        return `${Math.round(Number(val))}%`;
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    labels: vietnameseLabels,
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        offsetX: -5,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 5,
      },
      labels: {
        colors: theme.palette.text.secondary,
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '60%',
        },
      },
    },
    stroke: {
      width: 2,
      colors: [theme.palette.background.paper],
    },
    theme: {
      mode: theme.palette.mode,
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => `${value} đơn hàng`,
      },
    },
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Đơn hàng theo trạng thái" />
      <CardContent>
        <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
      </CardContent>
    </Card>
  );
}
