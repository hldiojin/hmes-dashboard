import { useEffect, useState } from 'react';

import { getOrders, OrdersFilter } from '../services/orderService';
import { Order, OrderStatus } from '../types/order';

export interface OrderOverviewData {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: { status: string; count: number }[];
  latestOrders: Array<{
    id: string;
    reference: string;
    customer: { name: string };
    amount: number;
    status: OrderStatus;
    createdAt: string;
  }>;
  revenueByDay: { date: string; revenue: number }[];
}

export interface SearchFilters {
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useOrderOverview = () => {
  const [data, setData] = useState<OrderOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [statsOrderCount, setStatsOrderCount] = useState<number>(100); // Default to 100 orders

  const fetchAllOrdersForStats = async (orderCount: number) => {
    try {
      const apiFilters: OrdersFilter = {
        pageIndex: 1,
        pageSize: orderCount, // Use the provided order count
      };

      const allOrdersResponse = await getOrders(apiFilters);
      return allOrdersResponse.orders;
    } catch (err) {
      console.error('Failed to fetch all orders for statistics:', err);
      return [];
    }
  };

  const fetchOverviewData = async (searchFilters: SearchFilters = {}, orderCount: number = statsOrderCount) => {
    try {
      setLoading(true);

      // Fetch latest orders for the table view (limited to 10)
      const apiFilters: OrdersFilter = {
        pageIndex: 1,
        pageSize: 10,
        ...searchFilters,
      };

      // Fetch orders for table display
      const response = await getOrders(apiFilters);

      // Fetch all orders for statistics and charts
      const allOrders = await fetchAllOrdersForStats(orderCount);

      // Calculate total revenue from all orders
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Map to the format needed for LatestOrders component (using the limited dataset)
      const latestOrders = response.orders.map((order) => ({
        id: order.id,
        reference: order.orderNumber,
        customer: { name: order.fullName || 'Unknown Customer' },
        amount: order.totalAmount,
        // Map your OrderStatus to the statuses used in the component
        status: mapOrderStatusToComponent(order.status),
        createdAt: order.date,
      }));

      // Calculate revenue by day for charts (using the full dataset)
      const revenueByDay = calculateRevenueByDay(allOrders);

      // Calculate orders by status for pie chart (using the full dataset)
      const ordersByStatus = calculateOrdersByStatus(allOrders);

      setData({
        totalRevenue,
        totalOrders: response.totalItems,
        ordersByStatus,
        latestOrders,
        revenueByDay,
      });
    } catch (err) {
      console.error('Failed to fetch order overview data:', err);
      setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOverviewData(filters, statsOrderCount);
  }, [statsOrderCount]); // Re-fetch when order count changes

  // Function to update filters and re-fetch data
  const searchOrders = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    fetchOverviewData(newFilters, statsOrderCount);
  };

  // Function to update the number of orders for statistics
  const updateStatsOrderCount = (count: number) => {
    setStatsOrderCount(count);
  };

  return {
    data,
    loading,
    error,
    searchOrders,
    filters,
    statsOrderCount,
    updateStatsOrderCount,
  };
};

// Helper function to map order status to component status
function mapOrderStatusToComponent(status: string): OrderStatus {
  switch (status) {
    case 'Success':
      return 'Success';
    case 'Cancelled':
      return 'Cancelled';
    case 'Delivering':
      return 'Delivering';
    case 'IsWaiting':
      return 'IsWaiting';
    case 'Pending':
    default:
      return 'Pending';
  }
}

// Helper function to calculate orders by status
function calculateOrdersByStatus(orders: Order[]): { status: string; count: number }[] {
  if (!orders || orders.length === 0) {
    return [
      { status: 'Pending', count: 0 },
      { status: 'IsWaiting', count: 0 },
      { status: 'Delivering', count: 0 },
      { status: 'Success', count: 0 },
      { status: 'Cancelled', count: 0 },
    ];
  }

  // Count orders by status
  const statusCounts = {
    Pending: 0,
    IsWaiting: 0,
    Delivering: 0,
    Success: 0,
    Cancelled: 0,
  };

  orders.forEach((order) => {
    const status = order.status as keyof typeof statusCounts;
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    } else {
      // Default to pending if status is not recognized
      statusCounts.Pending++;
    }
  });

  // Convert to array format for the chart
  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));
}

// Helper function to calculate revenue by day
function calculateRevenueByDay(orders: Order[]): { date: string; revenue: number }[] {
  if (!orders || orders.length === 0) {
    // If no orders, return empty array with 12 months of zero revenue
    return Array.from({ length: 12 }, (_, i) => {
      return {
        date: `${i + 1}`, // T1, T2, etc.
        revenue: 0,
      };
    });
  }

  // Initialize monthly totals with zeros
  const monthlyRevenue: number[] = Array(12).fill(0);

  // Group orders by month and sum the total
  orders.forEach((order) => {
    const orderDate = new Date(order.date);
    const month = orderDate.getMonth(); // 0-11
    monthlyRevenue[month] += order.totalAmount;
  });

  // Convert to the expected format
  return monthlyRevenue.map((revenue, index) => ({
    date: `${index + 1}`, // T1, T2, etc.
    revenue,
  }));
}
