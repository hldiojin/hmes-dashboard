'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  MenuItem,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Order, OrderItem } from '../../../../../types/order';
import { getOrderById, updateOrder } from '../../../../../services/orderService';

interface EditOrderItemInput extends OrderItem {
  isNew?: boolean;
}

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const orderId = params.id;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<EditOrderItemInput[]>([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
          setItems(data.items);
          setShippingAddress(data.shippingAddress);
          setPaymentMethod(data.paymentMethod);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const addItem = () => {
    const newItem: EditOrderItemInput = {
      id: `new-item-${Date.now()}`,
      productId: `prod-${Date.now()}`,
      productName: '',
      price: 0,
      quantity: 1,
      subtotal: 0,
      isNew: true
    };
    
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      
      // Track removed items for API
      if (!id.startsWith('new-item-')) {
        setRemovedItemIds([...removedItemIds, id]);
      }
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Update subtotal if price or quantity changes
        if (field === 'price' || field === 'quantity') {
          updatedItem.subtotal = updatedItem.price * updatedItem.quantity;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const updateShippingAddress = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;
    
    // Validate form data
    const emptyItems = items.some(item => !item.productName || item.price <= 0);
    if (emptyItems) {
      setError('Please fill in all product details with valid prices.');
      return;
    }
    
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zipCode || !shippingAddress.country) {
      setError('Please fill in the complete shipping address.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare updated order data
      const updatedOrderData: Partial<Order> = {
        items: items.map(item => ({
          id: item.id.startsWith('new-item-') ? `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` : item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        })),
        shippingAddress,
        paymentMethod,
      };
      
      // Update the order
      await updateOrder(orderId, updatedOrderData);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/dashboard/order/${orderId}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to update order:', error);
      setError('An error occurred while updating the order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/order')}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>
        <Alert severity="error">Order not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/dashboard/order/${orderId}`)}
          sx={{ mr: 2 }}
        >
          Back to Order Details
        </Button>
        <Typography variant="h4">Edit Order {order.orderNumber}</Typography>
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
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Order Number"
                      value={order.orderNumber}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Date"
                      value={new Date(order.date).toLocaleDateString()}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Customer ID"
                      value={order.userId}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
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
                          value={`$${item.subtotal.toFixed(2)}`}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton 
                          color="error" 
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    {index < items.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={addItem}
                  sx={{ mt: 2 }}
                >
                  Add Item
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Typography variant="h6">
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Shipping Address</Typography>
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
                <Typography variant="h6" gutterBottom>Payment Information</Typography>
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                >
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </TextField>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => router.push(`/dashboard/order/${orderId}`)}
                sx={{ mr: 2 }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
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
          Order updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}