'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';

import { createOrder } from '../../../../services/orderService';
import { Order, PaymentMethod } from '../../../../types/order';

interface OrderItemInput {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

const generateProductId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItemInput[]>([
    { id: `item-${Date.now()}`, productId: generateProductId(), productName: '', price: 0, quantity: 1 },
  ]);

  const [userId, setUserId] = useState('user1'); // In a real app, you'd select from available users

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        productId: generateProductId(),
        productName: '',
        price: 0,
        quantity: 1,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItemInput, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const updateShippingAddress = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  const calculateSubtotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + calculateSubtotal(item.price, item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const emptyItems = items.some((item) => !item.productName || item.price <= 0);
    if (emptyItems) {
      setError('Please fill in all product details with valid prices.');
      return;
    }

    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.country
    ) {
      setError('Please fill in the complete shipping address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order data
      const orderData: Partial<Order> = {
        userId,
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: calculateSubtotal(item.price, item.quantity),
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: calculateTotal(),
      };

      // Create the order
      await createOrder(orderData);
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/order');
      }, 1500);
    } catch (error) {
      console.error('Failed to create order:', error);
      setError('An error occurred while creating the order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/order')} sx={{ mr: 2 }}>
          Back to Orders
        </Button>
        <Typography variant="h4">Create New Order</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Customer"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                >
                  <MenuItem value="user1">John Doe (user1)</MenuItem>
                  <MenuItem value="user2">Jane Smith (user2)</MenuItem>
                </TextField>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                {items.map((item, index) => (
                  <Box key={item.id} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Product Name"
                          value={item.productName}
                          onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Price"
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                          InputProps={{ startAdornment: '$' }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                          inputProps={{ min: 1 }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Subtotal"
                          value={`$${calculateSubtotal(item.price, item.quantity).toFixed(2)}`}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton color="error" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    {index < items.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
                  Add Item
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={shippingAddress.street}
                      onChange={(e) => updateShippingAddress('street', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) => updateShippingAddress('city', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={shippingAddress.state}
                      onChange={(e) => updateShippingAddress('state', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ZIP/Postal Code"
                      value={shippingAddress.zipCode}
                      onChange={(e) => updateShippingAddress('zipCode', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={shippingAddress.country}
                      onChange={(e) => updateShippingAddress('country', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  sx={{ mb: 2 }}
                  required
                >
                  <MenuItem value="BANK">Bank Transfer</MenuItem>
                  <MenuItem value="COD">Cash on Delivery</MenuItem>
                </TextField>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" color="primary" size="large" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Order created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
