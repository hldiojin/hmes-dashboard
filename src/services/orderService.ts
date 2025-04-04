import { Order, OrderItem, OrderStatus } from '../types/order';

// Mock data (replace with actual API calls in production)
let mockOrders: Order[] = [
  {
    id: '1',
    userId: 'user1',
    orderNumber: 'ORD-2025-0001',
    date: '2025-04-01',
    status: 'delivered',
    items: [
      {
        id: 'item1',
        productId: 'prod1',
        productName: 'Laptop',
        quantity: 1,
        price: 1200,
        subtotal: 1200
      }
    ],
    totalAmount: 1200,
    shippingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK123456'
  },
  {
    id: '2',
    userId: 'user1',
    orderNumber: 'ORD-2025-0002',
    date: '2025-04-03',
    status: 'shipped',
    items: [
      {
        id: 'item2',
        productId: 'prod2',
        productName: 'Smartphone',
        quantity: 1,
        price: 800,
        subtotal: 800
      }
    ],
    totalAmount: 800,
    shippingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentMethod: 'PayPal',
    trackingNumber: 'TRK789012'
  },
  // Adding more orders with various statuses for testing
  {
    id: '3',
    userId: 'user2',
    orderNumber: 'ORD-2025-0003',
    date: '2025-04-04',
    status: 'pending',
    items: [
      {
        id: 'item3',
        productId: 'prod3',
        productName: 'Headphones',
        quantity: 1,
        price: 150,
        subtotal: 150
      },
      {
        id: 'item4',
        productId: 'prod4',
        productName: 'Mouse',
        quantity: 2,
        price: 35,
        subtotal: 70
      }
    ],
    totalAmount: 220,
    shippingAddress: {
      street: '456 Elm St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'Credit Card'
  },
  {
    id: '4',
    userId: 'user1',
    orderNumber: 'ORD-2025-0004',
    date: '2025-04-04',
    status: 'processing',
    items: [
      {
        id: 'item5',
        productId: 'prod5',
        productName: 'Monitor',
        quantity: 1,
        price: 350,
        subtotal: 350
      }
    ],
    totalAmount: 350,
    shippingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentMethod: 'Credit Card'
  },
  {
    id: '5',
    userId: 'user3',
    orderNumber: 'ORD-2025-0005',
    date: '2025-04-04',
    status: 'cancelled',
    items: [
      {
        id: 'item6',
        productId: 'prod6',
        productName: 'Keyboard',
        quantity: 1,
        price: 85,
        subtotal: 85
      }
    ],
    totalAmount: 85,
    shippingAddress: {
      street: '789 Oak St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    paymentMethod: 'PayPal'
  },
  {
    id: '6',
    userId: 'user2',
    orderNumber: 'ORD-2025-0006',
    date: '2025-04-05',
    status: 'pending',
    items: [
      {
        id: 'item7',
        productId: 'prod7',
        productName: 'External SSD',
        quantity: 1,
        price: 120,
        subtotal: 120
      }
    ],
    totalAmount: 120,
    shippingAddress: {
      street: '456 Elm St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'Bank Transfer'
  },
  {
    id: '7',
    userId: 'user4',
    orderNumber: 'ORD-2025-0007',
    date: '2025-04-05',
    status: 'processing',
    items: [
      {
        id: 'item8',
        productId: 'prod8',
        productName: 'Wireless Earbuds',
        quantity: 1,
        price: 95,
        subtotal: 95
      },
      {
        id: 'item9',
        productId: 'prod9',
        productName: 'Phone Case',
        quantity: 1,
        price: 25,
        subtotal: 25
      }
    ],
    totalAmount: 120,
    shippingAddress: {
      street: '101 Pine St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    paymentMethod: 'Credit Card'
  },
  {
    id: '8',
    userId: 'user1',
    orderNumber: 'ORD-2025-0008',
    date: '2025-04-05',
    status: 'pending',
    items: [
      {
        id: 'item10',
        productId: 'prod10',
        productName: 'Tablet',
        quantity: 1,
        price: 450,
        subtotal: 450
      }
    ],
    totalAmount: 450,
    shippingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentMethod: 'Credit Card'
  }
];

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Generate order number
const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
};

// READ - Get all orders
export const getOrders = async (): Promise<Order[]> => {
  // In real app: return await api.get('/orders');
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockOrders]), 500);
  });
};

// READ - Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  // In real app: return await api.get(`/orders/${orderId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === orderId) || null;
      resolve(order);
    }, 500);
  });
};

// CREATE - Create a new order
export interface CreateOrderInput {
  userId: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export const createOrder = async (orderData: CreateOrderInput): Promise<Order> => {
  // In real app: return await api.post('/orders', orderData);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Calculate subtotals and total
      const items = orderData.items.map(item => ({
        id: generateId(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));
      
      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
      
      // Create new order
      const newOrder: Order = {
        id: generateId(),
        userId: orderData.userId,
        orderNumber: generateOrderNumber(),
        date: new Date().toISOString().split('T')[0],
        status: 'pending' as OrderStatus,
        items,
        totalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod
      };
      
      mockOrders.push(newOrder);
      resolve(newOrder);
    }, 500);
  });
};

// UPDATE - Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  // In real app: return await api.put(`/orders/${orderId}/status`, { status });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        const updatedOrder = { 
          ...mockOrders[orderIndex],
          status 
        };
        
        // Add tracking number if status is changing to shipped
        if (status === 'shipped' && !updatedOrder.trackingNumber) {
          updatedOrder.trackingNumber = `TRK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        }
        
        mockOrders[orderIndex] = updatedOrder;
        resolve(updatedOrder);
      } else {
        reject(new Error('Order not found'));
      }
    }, 500);
  });
};

// UPDATE - Update entire order
export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<Order> => {
  // In real app: return await api.put(`/orders/${orderId}`, orderData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        // Calculate new total if items are updated
        let totalAmount = mockOrders[orderIndex].totalAmount;
        
        if (orderData.items) {
          const items = orderData.items.map(item => ({
            ...item,
            subtotal: item.price * item.quantity
          }));
          
          totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
          orderData.items = items;
        }
        
        const updatedOrder = { 
          ...mockOrders[orderIndex],
          ...orderData,
          totalAmount: orderData.items ? totalAmount : mockOrders[orderIndex].totalAmount
        };
        
        mockOrders[orderIndex] = updatedOrder;
        resolve(updatedOrder);
      } else {
        reject(new Error('Order not found'));
      }
    }, 500);
  });
};

// DELETE - Delete an order
export const deleteOrder = async (orderId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to delete order with ID: ${orderId}`);
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      console.log(`Order index in mock data: ${orderIndex}`);
      
      if (orderIndex >= 0) {
        const order = mockOrders[orderIndex];
        
        // Check status
        if (order.status === 'shipped' || order.status === 'delivered') {
          console.error(`Cannot delete order with status: ${order.status}`);
          reject(new Error(`Cannot delete order with status: ${order.status}`));
          return;
        }
        
        const orderNumber = order.orderNumber;
        mockOrders = mockOrders.filter(o => o.id !== orderId);
        console.log(`Order ${orderNumber} deleted successfully`);
        resolve(true);
      } else {
        console.error('Order not found');
        reject(new Error('Order not found'));
      }
    }, 500);
  });
};