import { useEffect, useState } from 'react';

import { getOrders, OrdersFilter } from '../services/orderService';
import { Order, OrderStatus } from '../types/order';

export interface OrderOverviewData {
  totalRevenue: number;
  totalOrders: number;
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

  const fetchOverviewData = async (searchFilters: SearchFilters = {}) => {
    try {
      setLoading(true);
      const apiFilters: OrdersFilter = {
        pageIndex: 1,
        pageSize: 10,
        ...searchFilters,
      };

      // Fetch orders using your existing service
      const response = await getOrders(apiFilters);

      // Calculate total revenue from orders
      const totalRevenue = response.orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Map to the format needed for LatestOrders component
      const latestOrders = response.orders.map((order) => ({
        id: order.id,
        reference: order.orderNumber,
        customer: { name: order.fullName || 'Unknown Customer' },
        amount: order.totalAmount,
        // Map your OrderStatus to the statuses used in the component
        status: mapOrderStatusToComponent(order.status),
        createdAt: order.date,
      }));

      // Calculate revenue by day for charts
      const revenueByDay = calculateRevenueByDay(response.orders);

      setData({
        totalRevenue,
        totalOrders: response.totalItems,
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
    fetchOverviewData(filters);
  }, []);

  // Function to update filters and re-fetch data
  const searchOrders = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    fetchOverviewData(newFilters);
  };

  return { data, loading, error, searchOrders, filters };
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
    case 'Pending':
    default:
      return 'Pending';
  }
}

// Helper function to calculate revenue by day
function calculateRevenueByDay(orders: Order[]): { date: string; revenue: number }[] {
  // Group orders by date and sum the total
  const revenueMap = new Map<string, number>();

  orders.forEach((order) => {
    const dateStr = new Date(order.date).toISOString().split('T')[0];
    const currentTotal = revenueMap.get(dateStr) || 0;
    revenueMap.set(dateStr, currentTotal + order.totalAmount);
  });

  // Convert to array and sort by date
  return Array.from(revenueMap, ([date, revenue]) => ({ date, revenue })).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
