import axiosInstance from '../api/axiosInstance';
import { Order, OrderItem, OrderStatus, PaymentMethod, TransactionStatus } from '../types/order';

// API response types
export interface OrdersResponse {
  statusCodes: number;
  response: {
    data: ApiOrder[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface ApiOrder {
  id: string;
  userId: string;
  fullName: string;
  userAddressId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Order details response types
export interface OrderDetailsResponse {
  statusCodes: number;
  response: {
    data: OrderDetailsData;
  };
}

export interface OrderDetailsData {
  orderId: string;
  totalPrice: number;
  status: string;
  orderDetailsItems: OrderDetailsItem[];
  userAddress: UserAddress;
  transactions: Transaction[];
}

export interface OrderDetailsItem {
  orderDetailsId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface UserAddress {
  addressId: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  longitude: string | null;
  latitude: string | null;
}

export interface Transaction {
  transactionId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: TransactionStatus;
  createdAt: string;
}

// READ - Get all orders with pagination and filters
export interface OrdersFilter {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PaginatedOrders {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  lastPage: boolean;
}

export const getOrders = async (filters: OrdersFilter = {}): Promise<PaginatedOrders> => {
  try {
    console.log('Fetching orders with filters:', filters);

    // Build query parameters
    const params = new URLSearchParams();

    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    if (filters.startDate) {
      // Convert datetime-local format to ISO string for API
      params.append('startDate', filters.startDate);
    }

    if (filters.endDate) {
      // Convert datetime-local format to ISO string for API
      params.append('endDate', filters.endDate);
    }

    if (filters.status) {
      if (filters.status !== '') {
        params.append('status', filters.status);
      }
    }

    // Always include pagination parameters with defaults
    params.append('pageIndex', String(filters.pageIndex || 1));
    params.append('pageSize', String(filters.pageSize || 10));

    // Call API with query parameters
    const response = await axiosInstance.get<OrdersResponse>(`order?${params.toString()}`);
    console.log('API response:', response.data);

    // Validate response structure
    if (!response.data || !response.data.response || !Array.isArray(response.data.response.data)) {
      throw new Error('Invalid response format from API');
    }

    // Map API response to our internal Order type
    const orders = response.data.response.data.map((apiOrder) => ({
      id: apiOrder.id,
      userId: apiOrder.userId,
      orderNumber: apiOrder.id.substring(0, 8).toUpperCase(), // Generate a shorter order number from ID
      date: new Date(apiOrder.createdAt).toISOString(),
      status: mapApiStatus(apiOrder.status),
      totalAmount: apiOrder.totalPrice,
      items: [], // We'll need another API call to get items for details view
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      paymentMethod: 'BANK' as PaymentMethod, // Default value
      fullName: apiOrder.fullName,
    }));

    return {
      orders,
      currentPage: response.data.response.currentPage,
      totalPages: response.data.response.totalPages,
      totalItems: response.data.response.totalItems,
      pageSize: response.data.response.pageSize,
      lastPage: response.data.response.lastPage,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Helper function to map API status to our OrderStatus enum
function mapApiStatus(apiStatus: string): OrderStatus {
  // Convert to consistent casing for matching
  const status = apiStatus.toUpperCase();

  // Match to our OrderStatus type
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'DELIVERING':
      return 'Delivering';
    case 'SUCCESS':
      return 'Success';
    case 'CANCELLED':
    case 'CANCELED': // Handle both spellings
      return 'Cancelled';
    default:
      console.warn(`Unknown status from API: ${apiStatus}, defaulting to 'Pending'`);
      return 'Pending';
  }
}

// READ - Get order details by ID
export const getOrderDetails = async (orderId: string): Promise<OrderDetailsData | null> => {
  try {
    const response = await axiosInstance.get<OrderDetailsResponse>(`order/${orderId}`);
    console.log('Order details response:', response.data);

    if (response.data && response.data.statusCodes === 200 && response.data.response.data) {
      return response.data.response.data;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching order details for ID ${orderId}:`, error);
    return null;
  }
};

// READ - Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const response = await axiosInstance.get<OrderDetailsResponse>(`order/${orderId}`);
    console.log('Order details response:', response.data);

    if (response.data && response.data.statusCodes === 200 && response.data.response.data) {
      // Map API order details to Order type
      const orderDetails = response.data.response.data;
      const items = orderDetails.orderDetailsItems.map((item) => ({
        id: item.orderDetailsId,
        productId: item.orderDetailsId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.totalPrice,
      }));

      // Get transaction if available
      const transaction =
        orderDetails.transactions && orderDetails.transactions.length > 0 ? orderDetails.transactions[0] : null;

      // Create an Order object from OrderDetailsData
      const order: Order = {
        id: orderDetails.orderId,
        userId: orderDetails.userAddress?.name || '',
        orderNumber: orderDetails.orderId.slice(0, 8).toUpperCase(),
        date: transaction ? transaction.createdAt : new Date().toISOString(),
        status: orderDetails.status as OrderStatus,
        items,
        totalAmount: orderDetails.totalPrice,
        shippingAddress: {
          street: orderDetails.userAddress?.address || '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        paymentMethod: transaction?.paymentMethod || 'BANK',
        fullName: orderDetails.userAddress?.name,
      };

      return order;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching order details for ID ${orderId}:`, error);
    return null;
  }
};

// UPDATE - Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  try {
    // In a real application, this would call the API to update the order status
    const response = await axiosInstance.put<OrderDetailsResponse>(`order/${orderId}/status`, { status });

    if (response.data && response.data.statusCodes === 200) {
      // Return the updated order by getting it again
      const updatedOrder = await getOrderById(orderId);
      if (updatedOrder) {
        return updatedOrder;
      }
    }

    throw new Error('Failed to update order status');
  } catch (error) {
    console.error(`Error updating order status for ID ${orderId}:`, error);
    throw error;
  }
};
