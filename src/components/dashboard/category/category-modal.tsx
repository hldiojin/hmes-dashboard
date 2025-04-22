'use client';

import * as React from 'react';
import categoryService from '@/services/categoryService';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { UploadSimple as UploadIcon } from '@phosphor-icons/react';

import { Category } from '@/types/category';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  category?: Category;
  mode?: 'create' | 'update';
}

export function CategoryModal({
  open,
  onClose,
  onSubmit,
  category,
  mode = 'create',
}: CategoryModalProps): React.JSX.Element {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [parentCategoryId, setParentCategoryId] = React.useState<string>('');
  const [status, setStatus] = React.useState('Active');
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [parentCategories, setParentCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Form validation
  const [errors, setErrors] = React.useState({
    name: '',
    description: '',
    file: '',
  });

  // Fetch parent categories on mount
  React.useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          const response = await categoryService.getAllCategories();
          setParentCategories(response.response.data);
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }
  }, [open]);

  // Reset form when modal is closed or set initial values if category is provided
  React.useEffect(() => {
    if (!open) {
      resetForm();
    } else if (category && mode === 'update') {
      setName(category.name || '');
      setDescription(category.description || '');
      setParentCategoryId(category.parentCategoryId || '');
      setStatus(category.status || 'Active');

      // Set file preview if attachment exists
      if (category.attachment) {
        setFilePreview(category.attachment);
      }
    } else {
      resetForm();
    }
  }, [open, category, mode]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setParentCategoryId('');
    setStatus('Active');
    setFile(null);
    setFilePreview(null);
    setErrors({
      name: '',
      description: '',
      file: '',
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile) {
      // Check if file is an image
      if (!selectedFile.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, file: 'File must be an image' }));
        return;
      }

      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, file: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: name.trim() ? '' : 'Tên loại sản phẩm không được để trống',
      description: description.trim() ? '' : 'Mô tả không được để trống',
      file: mode === 'update' && filePreview ? '' : file ? '' : 'Hình ảnh không được để trống',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Include ID for updates
      if (mode === 'update' && category?.id) {
        formData.append('Id', category.id);
      }

      formData.append('Name', name);
      formData.append('Description', description);
      formData.append('Status', status);

      if (parentCategoryId) {
        formData.append('ParentCategoryId', parentCategoryId);
      }

      if (file) {
        formData.append('Attachment', file);
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Thêm loại sản phẩm mới' : 'Cập nhật loại sản phẩm'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Tên"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />

          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            required
          />

          <FormControl fullWidth>
            <InputLabel id="parent-category-label">Loại sản phẩm chính</InputLabel>
            <Select
              labelId="parent-category-label"
              value={parentCategoryId}
              label="Loại sản phẩm cha"
              onChange={(e) => setParentCategoryId(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Không có</em>
              </MenuItem>
              {parentCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Tùy chọn</FormHelperText>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Trạng thái
            </Typography>
            <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)}>
              <FormControlLabel value="Active" control={<Radio />} label="Hoạt động" />
              <FormControlLabel value="Inactive" control={<Radio />} label="Không hoạt động" />
            </RadioGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Hình ảnh
            </Typography>
            <Box
              sx={{
                border: '1px dashed',
                borderColor: errors.file ? 'error.main' : 'divider',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                mb: 1,
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />

              {filePreview ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={filePreview}
                    alt="Preview"
                    sx={{
                      maxHeight: 150,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      mb: 1,
                    }}
                  />
                  <Typography variant="caption">Nhấn để thay đổi</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <UploadIcon size={40} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Nhấn để tải lên hình ảnh
                  </Typography>
                </Box>
              )}
            </Box>
            {errors.file && <FormHelperText error>{errors.file}</FormHelperText>}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Đang xử lý...' : mode === 'create' ? 'Thêm loại sản phẩm' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryModal;
