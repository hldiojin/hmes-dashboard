export type OrderStatus =
  | 'Success'
  | 'Pending'
  | 'PendingPayment'
  | 'Delivering'
  | 'AllowRepayment'
  | 'Cancelled'
  | 'IsWaiting';

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
  subtotal?: number; // Optional subtotal before shipping
  shippingFee?: number; // Optional shipping fee
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
  return ['Success', 'Pending', 'PendingPayment', 'Delivering', 'AllowRepayment', 'Cancelled', 'IsWaiting'].includes(
    status
  );
}

export function isValidTransactionStatus(status: string): status is TransactionStatus {
  return ['PAID', 'PENDING', 'CANCELLED', 'PROCESSING'].includes(status);
}

export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return ['BANK', 'COD'].includes(method);
}

// Formatting helper functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
  const labels: Record<OrderStatus, string> = {
    Pending: 'Chờ xử lý',
    PendingPayment: 'Chờ thanh toán',
    Delivering: 'Đang giao',
    AllowRepayment: 'Cho phép thanh toán lại',
    Success: 'Thành công',
    Cancelled: 'Đã hủy',
    IsWaiting: 'Chờ xác nhận',
  };

  return labels[status] || status;
}

// Transaction status display helper
export function getTransactionStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    PAID: '✅ Đã thanh toán',
    PENDING: '⏳ Chờ thanh toán',
    CANCELLED: '❌ Đã hủy thanh toán',
    PROCESSING: '🔄 Đang xử lý',
  };

  return labels[status] || status;
}

// Payment method display helper
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    BANK: '🏦 Chuyển khoản',
    COD: '💵 Thanh toán khi nhận hàng',
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
