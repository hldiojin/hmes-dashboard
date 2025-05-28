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
  price: number;
  shippingFee: number;
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

// Order confirmation request type
export interface OrderConfirmRequest {
  orderId: string;
  status: 'Delivering' | 'Cancelled';
}

// Order confirmation response type
export interface OrderConfirmResponse {
  statusCodes: number;
  response: {
    message: string;
  };
}

// Helper function to normalize Vietnamese text for searching
export const normalizeVietnameseText = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
};

// Function to check if a search query is included in a text, considering Vietnamese characters
export const vietnameseIncludes = (text: string, search: string): boolean => {
  if (!text || !search) return false;

  const normalizedText = normalizeVietnameseText(text);
  const normalizedSearch = normalizeVietnameseText(search);

  return normalizedText.includes(normalizedSearch);
};

// For debouncing requests
let debounceTimer: NodeJS.Timeout | null = null;

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
    case 'ISWAITING':
      return 'IsWaiting';
    default:
      console.warn(`Unknown status from API: ${apiStatus}, defaulting to 'Pending'`);
      return 'Pending';
  }
}

export const getOrders = async (filters: OrdersFilter = {}): Promise<PaginatedOrders> => {
  try {
    // Build query parameters for the API request
    const params = new URLSearchParams();

    // Only add defined and non-empty filters
    if (filters.keyword && filters.keyword.trim()) {
      params.append('keyword', filters.keyword.trim());
    }

    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      params.append('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      params.append('maxPrice', filters.maxPrice.toString());
    }

    // Proper date handling with error checking
    if (filters.startDate) {
      try {
        const startDate = new Date(filters.startDate);
        if (!isNaN(startDate.getTime())) {
          params.append('startDate', startDate.toISOString());
        }
      } catch (error) {
        console.warn('Invalid startDate format:', filters.startDate);
      }
    }

    if (filters.endDate) {
      try {
        const endDate = new Date(filters.endDate);
        if (!isNaN(endDate.getTime())) {
          params.append('endDate', endDate.toISOString());
        }
      } catch (error) {
        console.warn('Invalid endDate format:', filters.endDate);
      }
    }

    // Add status filter if valid
    if (filters.status && filters.status.trim() !== '') {
      params.append('status', filters.status);
    }

    // Always include pagination parameters with validation
    const pageIndex = Math.max(1, filters.pageIndex || 1);
    const pageSize = Math.max(5, filters.pageSize || 10);

    params.append('pageIndex', String(pageIndex));
    params.append('pageSize', String(pageSize));

    console.log('Making API request with params:', params.toString());

    try {
      // Make the API request
      const response = await axiosInstance.get<OrdersResponse>(`order?${params.toString()}`);

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response format from API');
      }

      // Debug pagination response values
      console.log('Pagination response values:', {
        currentPage: response.data.response.currentPage,
        totalPages: response.data.response.totalPages,
        totalItems: response.data.response.totalItems,
        pageSize: response.data.response.pageSize,
        lastPage: response.data.response.lastPage,
      });

      // Ensure data is an array, even if empty
      const apiOrders = Array.isArray(response.data.response.data) ? response.data.response.data : [];

      // Map API response to Order objects
      const orders = apiOrders.map((apiOrder) => ({
        id: apiOrder.id,
        userId: apiOrder.userId,
        orderNumber: apiOrder.id.substring(0, 8).toUpperCase(),
        date: new Date(apiOrder.createdAt).toISOString(),
        status: mapApiStatus(apiOrder.status),
        totalAmount: apiOrder.totalPrice,
        items: [],
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        paymentMethod: 'BANK' as PaymentMethod,
        fullName: apiOrder.fullName,
      }));

      // Prepare result object with validated pagination values
      return {
        orders,
        currentPage: response.data.response.currentPage || pageIndex,
        totalPages: response.data.response.totalPages || 1,
        totalItems: response.data.response.totalItems || orders.length,
        pageSize: response.data.response.pageSize || pageSize,
        lastPage:
          response.data.response.lastPage || response.data.response.currentPage >= response.data.response.totalPages,
      };
    } catch (error) {
      console.error('API request failed:', error);
      // Return empty result set on error to prevent UI issues
      return {
        orders: [],
        currentPage: pageIndex,
        totalPages: 1,
        totalItems: 0,
        pageSize: pageSize,
        lastPage: true,
      };
    }
  } catch (error) {
    console.error('Error in getOrders:', error);
    // Return a fallback empty result set to prevent UI issues
    return {
      orders: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: filters.pageSize || 10,
      lastPage: true,
    };
  }
};

// Debounced version of getOrders for search fields
export const debouncedGetOrders = (filters: OrdersFilter = {}, callback: (result: PaginatedOrders) => void) => {
  // Clear any previous pending debounce
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new debounce timer - tăng thời gian lên 500ms để tránh gửi quá nhiều request
  debounceTimer = setTimeout(async () => {
    try {
      const result = await getOrders(filters);
      callback(result);
    } catch (error) {
      console.error('Debounced getOrders failed:', error);
      // Call callback with empty results to prevent UI issues
      callback({
        orders: [],
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: filters.pageSize || 10,
        lastPage: true,
      });
    } finally {
      // Đảm bảo xóa debounceTimer sau khi hoàn thành
      debounceTimer = null;
    }
  }, 500); // 500ms debounce delay
};

// Cache for order details
const orderDetailsCache = new Map<string, OrderDetailsData>();

// READ - Get order details by ID
export const getOrderDetails = async (orderId: string): Promise<OrderDetailsData | null> => {
  try {
    // Check cache first
    if (orderDetailsCache.has(orderId)) {
      return orderDetailsCache.get(orderId)!;
    }

    const response = await axiosInstance.get<OrderDetailsResponse>(`order/${orderId}`);

    if (response.data && response.data.statusCodes === 200 && response.data.response.data) {
      // Store in cache
      orderDetailsCache.set(orderId, response.data.response.data);
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
    // In a real implementation, you'd use the API to get detailed order information
    const detailsResponse = await getOrderDetails(orderId);

    if (!detailsResponse) {
      return null;
    }

    // Convert order details to Order type
    const order: Order = {
      id: detailsResponse.orderId,
      userId: '', // Not available in the details
      orderNumber: detailsResponse.orderId.substring(0, 8).toUpperCase(),
      date: detailsResponse.transactions[0]?.createdAt || new Date().toISOString(),
      status: mapApiStatus(detailsResponse.status),
      items: detailsResponse.orderDetailsItems.map((item) => ({
        id: item.orderDetailsId,
        productId: item.orderDetailsId, // Not available in details, using orderDetailsId as substitute
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.totalPrice,
      })),
      totalAmount: detailsResponse.totalPrice,
      subtotal: detailsResponse.price,
      shippingFee: detailsResponse.shippingFee,
      shippingAddress: {
        street: detailsResponse.userAddress.address,
        city: '', // Not available in current API
        state: '',
        zipCode: '',
        country: '',
      },
      paymentMethod: detailsResponse.transactions[0]?.paymentMethod || 'BANK',
    };

    return order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

// UPDATE - Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  try {
    // In a real application, this would call the API to update the order status
    const response = await axiosInstance.put<OrderDetailsResponse>(`order/${orderId}/status`, { status });

    if (response.data && response.data.statusCodes === 200) {
      // Clear cache for this order
      orderDetailsCache.delete(orderId);

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

// CONFIRM COD - Confirm or cancel COD order
export const confirmOrderCOD = async (orderId: string, status: 'Delivering' | 'Cancelled'): Promise<void> => {
  try {
    const requestData: OrderConfirmRequest = {
      orderId,
      status,
    };

    console.log('Confirming COD order:', requestData);

    const response = await axiosInstance.post<OrderConfirmResponse>('order/confirm-cod', requestData);

    if (response.data && response.data.statusCodes === 200) {
      // Clear cache for this order to force refresh
      orderDetailsCache.delete(orderId);
      console.log('Order COD confirmation successful:', response.data.response.message);
      return;
    }

    throw new Error(response.data?.response?.message || 'Failed to confirm COD order');
  } catch (error: any) {
    console.error(`Error confirming COD order for ID ${orderId}:`, error);

    // Extract error message from response if available
    const errorMessage =
      error.response?.data?.response?.message ||
      error.response?.data?.message ||
      error.message ||
      'Failed to confirm COD order';

    throw new Error(errorMessage);
  }
};

// CREATE - Create a new order
export const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    // This is a mock implementation
    console.log('Creating order with data:', orderData);

    // In a real implementation, you'd make an API call here
    // const response = await axiosInstance.post('order', orderData);

    // For now, return a mock response
    return {
      id: `order-${Date.now()}`,
      userId: 'user-1',
      orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      status: 'Pending',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      shippingAddress: orderData.shippingAddress || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      paymentMethod: orderData.paymentMethod || 'BANK',
      ...orderData,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// UPDATE - Update an existing order
export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<Order | null> => {
  try {
    // This is a mock implementation
    console.log(`Updating order ${orderId} with data:`, orderData);

    // In a real implementation, you'd make an API call here
    // const response = await axiosInstance.put(`order/${orderId}`, orderData);

    // Clear cache for this order
    orderDetailsCache.delete(orderId);

    // For now, just return the combined data
    const currentOrder = await getOrderById(orderId);

    if (!currentOrder) {
      throw new Error('Order not found');
    }

    return {
      ...currentOrder,
      ...orderData,
      // Make sure to calculate the total amount if items are being updated
      totalAmount: orderData.items
        ? orderData.items.reduce((sum, item) => sum + item.subtotal, 0)
        : currentOrder.totalAmount,
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return null;
  }
};
