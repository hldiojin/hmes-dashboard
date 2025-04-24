'use client';

import * as React from 'react';
import categoryService from '@/services/categoryService';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Category } from '@/types/category';
import { Product } from '@/types/product';

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  categoryId: z.string().min(1, 'Loại sản phẩm không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  mainImage: z.any().optional(),
  amount: z.string().min(1, 'Số lượng không được để trống'),
  price: z.string().min(1, 'Giá không được để trống'),
  status: z.enum(['Active', 'Inactive']).optional(),
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

// Custom file input component with Vietnamese text
const CustomFileInput = ({ 
  label, 
  error, 
  helperText, 
  onChange, 
  multiple = false 
}: { 
  label: string; 
  error?: boolean; 
  helperText?: string;
  onChange: (files: File | File[] | null) => void;
  multiple?: boolean;
}) => {
  const [selectedFiles, setSelectedFiles] = React.useState<string>('Chưa chọn tệp');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      setSelectedFiles('Chưa chọn tệp');
      onChange(null);
      return;
    }
    
    if (multiple) {
      setSelectedFiles(`Đã chọn ${files.length} tệp`);
      onChange(Array.from(files));
    } else {
      setSelectedFiles(files[0].name);
      onChange(files[0]);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleClick}
          size="small"
        >
          Chọn tệp
        </Button>
        <Typography 
          variant="body2" 
          color={error ? 'error' : 'text.secondary'}
        >
          {selectedFiles}
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          style={{ display: 'none' }}
          multiple={multiple}
          accept="image/*"
        />
      </Box>
      {error && helperText && (
        <FormHelperText error>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default function ProductModal({ open, onClose, onSubmit, product, mode }: ProductModalProps): React.JSX.Element {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [oldImages, setOldImages] = React.useState<string[]>([]);
  const [mainImageRemoved, setMainImageRemoved] = React.useState(false);

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (product) {
      console.log('Product received in modal:', product);
      console.log('Description:', product.description);
      console.log('Amount:', product.amount);
    }
  }, [product]);

  // Handle removing an image from oldImages
  const handleRemoveImage = (indexToRemove: number) => {
    setOldImages(oldImages.filter((_, index) => index !== indexToRemove));
  };

  // Handle removing the main image
  const handleRemoveMainImage = () => {
    setMainImageRemoved(true);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(mode === 'update' ? productSchema.partial({ mainImage: true }) : productSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      description: '',
      mainImage: null,
      amount: '',
      price: '',
      status: 'Active' as 'Active' | 'Inactive',
      images: [],
    },
  });

  // Add a watcher to monitor form values
  const formValues = watch();
  React.useEffect(() => {
    console.log('Current form values:', formValues);
  }, [formValues]);

  // Reset form and set initial values when product or modal state changes
  React.useEffect(() => {
    if (open && product && mode === 'update') {
      console.log('Setting form values for update:', {
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        amount: product.amount?.toString(),
        price: product.price?.toString(),
        status: product.status,
      });

      reset({
        name: product.name || '',
        categoryId: product.categoryId || '',
        description: product.description || '',
        mainImage: null, // Will be handled separately
        amount: product.amount?.toString() || '',
        price: product.price?.toString() || '',
        status: (product.status as 'Active' | 'Inactive') || 'Active',
        images: [],
      });

      // Use setValue as an alternative approach to ensure values are set
      setValue('description', product.description || '');
      setValue('amount', product.amount?.toString() || '');

      // Log after reset to verify values were set
      console.log('Form values after reset:', watch());

      if (product.images) {
        setOldImages(product.images);
      }

      // Reset main image removal state
      setMainImageRemoved(false);
    } else if (open && mode === 'create') {
      reset({
        name: '',
        categoryId: '',
        description: '',
        mainImage: null,
        amount: '',
        price: '',
        status: 'Active',
        images: [],
      });
      setOldImages([]);
      setMainImageRemoved(false);
    }
  }, [open, product, mode, reset, setValue, watch]);

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
    console.log('Form submitted with data:', data);
    setLoading(true);
    try {
      const formData = new FormData();

      // Add product ID when in update mode
      if (mode === 'update' && product?.id) {
        formData.append('Id', product.id);
      }

      formData.append('Name', data.name);
      formData.append('CategoryId', data.categoryId);
      formData.append('Description', data.description);
      formData.append('Amount', data.amount);
      formData.append('Price', data.price);
      formData.append('Status', 'Active');

      // Only append MainImage if it exists (a file was selected)
      if (data.mainImage) {
        formData.append('MainImage', data.mainImage);
      } else if (mainImageRemoved) {
        // If main image was removed, send empty string to indicate removal
        formData.append('MainImage', '');
      }

      // Handle old images in update mode
      if (mode === 'update') {
        oldImages.forEach((image) => {
          formData.append('OldImages', image);
        });
      }

      // Handle new images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('NewImages', image);
        });
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
      <DialogTitle>{mode === 'create' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}</DialogTitle>
      <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => {
                console.log('Rendering name field with value:', field.value);
                return (
                  <TextField
                    {...field}
                    label="Tên"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                );
              }}
            />

            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => {
                console.log('Rendering categoryId field with value:', field.value);
                return (
                  <FormControl fullWidth error={!!errors.categoryId}>
                    <InputLabel>Loại sản phẩm</InputLabel>
                    <Select {...field} label="Loại sản phẩm">
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.categoryId?.message}</FormHelperText>
                  </FormControl>
                );
              }}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => {
                console.log('Rendering description field with value:', field.value);
                return (
                  <TextField
                    {...field}
                    label="Mô tả"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                );
              }}
            />

            {/* Show current main image when in update mode */}
            {mode === 'update' && product?.mainImage && !mainImageRemoved && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Ảnh chính hiện tại:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Box
                    component="img"
                    src={product.mainImage}
                    alt="Hình ảnh chính hiện tại"
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark',
                      },
                      width: 24,
                      height: 24,
                      minWidth: 24,
                      p: 0,
                    }}
                    onClick={handleRemoveMainImage}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      X
                    </Typography>
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Replace standard file input with custom component for mainImage */}
            <Controller
              name="mainImage"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <CustomFileInput
                  label={mode === 'update' ? 'Những ảnh bổ sung hiện tại (tùy chọn)' : 'Hình ảnh chính'}
                  error={!!errors.mainImage}
                  helperText={errors.mainImage?.message as string}
                  onChange={(file) => onChange(file)}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field }) => {
                console.log('Rendering amount field with value:', field.value);
                return (
                  <TextField
                    {...field}
                    label="Số lượng"
                    type="number"
                    fullWidth
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                );
              }}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => {
                console.log('Rendering price field with value:', field.value);
                return (
                  <TextField
                    {...field}
                    label="Giá"
                    type="number"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                );
              }}
            />

            {/* Remove or comment out the status field - hiding it from UI */}
            {/* <Controller
              name="status"
              control={control}
              render={({ field }) => {
                console.log('Rendering status field with value:', field.value);
                return (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
                      <MenuItem value="Active">Hoạt động</MenuItem>
                      <MenuItem value="Inactive">Không hoạt động</MenuItem>
                    </Select>
                    <FormHelperText>{errors.status?.message}</FormHelperText>
                  </FormControl>
                );
              }}
            /> */}

            {/* Show current additional images when in update mode */}
            {mode === 'update' && oldImages.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Hình ảnh bổ sung hiện tại:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {oldImages.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        m: 0.5,
                      }}
                    >
                      <Box
                        component="img"
                        src={image}
                        alt={`Hình ảnh sản phẩm ${index}`}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'error.dark',
                          },
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          p: 0,
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          X
                        </Typography>
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Replace standard file input with custom component for images */}
            <Controller
              name="images"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <CustomFileInput
                  label={mode === 'update' ? 'Hình ảnh bổ sung mới (tùy chọn)' : 'Hình ảnh bổ sung'}
                  error={!!errors.images}
                  helperText={errors.images?.message as string}
                  onChange={(files) => onChange(files)}
                  multiple={true}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? mode === 'create'
                ? 'Đang thêm...'
                : 'Đang cập nhật...'
              : mode === 'create'
                ? 'Thêm sản phẩm'
                : 'Thay đổi sản phẩm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
