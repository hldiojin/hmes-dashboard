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
}

export function CategoryModal({ open, onClose, onSubmit }: CategoryModalProps): React.JSX.Element {
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

  // Reset form when modal is closed
  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

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
      name: name.trim() ? '' : 'Name is required',
      description: description.trim() ? '' : 'Description is required',
      file: file ? '' : 'Attachment is required',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('status', status);

      if (parentCategoryId) {
        formData.append('parentCategoryId', parentCategoryId);
      }

      if (file) {
        formData.append('attachment', file);
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
      <DialogTitle>Add New Category</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />

          <TextField
            label="Description"
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
            <InputLabel id="parent-category-label">Parent Category</InputLabel>
            <Select
              labelId="parent-category-label"
              value={parentCategoryId}
              label="Parent Category"
              onChange={(e) => setParentCategoryId(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {parentCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Optional</FormHelperText>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)}>
              <FormControlLabel value="Active" control={<Radio />} label="Active" />
              <FormControlLabel value="Inactive" control={<Radio />} label="Inactive" />
            </RadioGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Attachment
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
                  <Typography variant="caption">Click to change</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <UploadIcon size={40} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Click to upload an image
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
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Submitting...' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryModal;
