'use client';

import * as React from 'react';
import categoryService from '@/services/categoryService';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Category } from '@/types/category';
import { Product } from '@/types/product';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  mainImage: z.any().refine((file) => file !== null, 'Main image is required'),
  amount: z.string().min(1, 'Amount is required'),
  price: z.string().min(1, 'Price is required'),
  status: z.enum(['Active', 'Inactive']),
  images: z.array(z.any()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  product?: Product;
  mode: 'create' | 'update';
}

export default function ProductModal({ open, onClose, onSubmit, product, mode }: ProductModalProps): React.JSX.Element {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [oldImages, setOldImages] = React.useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      categoryId: product?.categoryId || '',
      description: product?.description || '',
      mainImage: null,
      amount: product?.amount?.toString() || '',
      price: product?.price?.toString() || '',
      status: (product?.status as 'Active' | 'Inactive') || 'Active',
      images: [],
    },
  });

  // Set old images when product changes
  React.useEffect(() => {
    if (product?.images) {
      setOldImages(product.images);
    }
  }, [product]);

  // Fetch categories when modal opens
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        // Get all child categories from the children array of each parent category
        const childCategories = response.response.data.flatMap((category) => category.children);
        setCategories(childCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleFormSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('categoryId', data.categoryId);
      formData.append('description', data.description);
      formData.append('mainImage', data.mainImage);
      formData.append('amount', data.amount);
      formData.append('price', data.price);
      formData.append('status', data.status);

      // Handle images based on mode
      if (mode === 'update') {
        // In update mode, append old images
        oldImages.forEach((image) => {
          formData.append('OldImages', image);
        });
      } else {
        // In create mode, append new images
        if (data.images && data.images.length > 0) {
          data.images.forEach((image) => {
            formData.append('Images', image);
          });
        }
      }

      await onSubmit(formData);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Product' : 'Update Product'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )}
            />

            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.categoryId}>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.categoryId?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="mainImage"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  type="file"
                  label="Main Image"
                  fullWidth
                  error={!!errors.mainImage}
                  helperText={errors.mainImage?.message as string}
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    onChange(file || null);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount"
                  type="number"
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price"
                  type="number"
                  fullWidth
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                  <FormHelperText>{errors.status?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="images"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  type="file"
                  label="Additional Images"
                  fullWidth
                  error={!!errors.images}
                  helperText={errors.images?.message}
                  onChange={(e) => {
                    const files = (e.target as HTMLInputElement).files;
                    onChange(files ? Array.from(files) : []);
                  }}
                  inputProps={{ multiple: true }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? mode === 'create'
                ? 'Adding...'
                : 'Updating...'
              : mode === 'create'
                ? 'Add Product'
                : 'Update Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
