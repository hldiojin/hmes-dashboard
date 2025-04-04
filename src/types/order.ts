export type OrderStatus = 'Success' | 'Pending' | 'Delivering' | 'Cancelled';

export type TransactionStatus = 'PAID' | 'PENDING' | 'CANCELLED' | 'PROCESSING';

export type PaymentMethod = 'BANK' | 'COD';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  fullName?: string; // Customer name from API
  createdAt?: string; // Raw created date from API
  updatedAt?: string; // Raw updated date from API
}

// Validation helper functions
export function isValidOrderStatus(status: string): status is OrderStatus {
  return ['Success', 'Pending', 'Delivering', 'Cancelled'].includes(status);
}

export function isValidTransactionStatus(status: string): status is TransactionStatus {
  return ['PAID', 'PENDING', 'CANCELLED', 'PROCESSING'].includes(status);
}

export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return ['BANK', 'COD'].includes(method);
}

// Formatting helper functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }
}

// Order status display helper
export function getOrderStatusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Transaction status display helper
export function getTransactionStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    PAID: '✅ Payment Completed',
    PENDING: '⏳ Payment Pending',
    CANCELLED: '❌ Payment Cancelled',
    PROCESSING: '🔄 Payment Processing',
  };

  return labels[status] || status;
}

// Payment method display helper
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    BANK: '🏦 Bank Transfer',
    COD: '💵 Cash on Delivery',
  };

  return labels[method] || method;
}

// Helper to get color for transaction status chips
export function getTransactionStatusColor(
  status: TransactionStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'PROCESSING':
      return 'info';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}
