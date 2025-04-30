'use client';

import * as React from 'react';
import { deviceService } from '@/services/deviceService';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { X } from '@phosphor-icons/react';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import MUIRichTextEditor from 'mui-rte';

import { CreateDeviceRequest } from '@/types/device';

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDeviceModal({ open, onClose, onSuccess }: AddDeviceModalProps): React.JSX.Element {
  const [name, setName] = React.useState<string>('');
  const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());
  const [editorContent, setEditorContent] = React.useState<string>('');
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const [price, setPrice] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    description?: string;
    attachment?: string;
    price?: string;
    quantity?: string;
    general?: string;
  }>({});

  // Reference to the editor
  const editorRef = React.useRef<any>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName('');
    setEditorState(EditorState.createEmpty());
    setEditorContent('');
    setAttachment(null);
    setPrice('');
    setQuantity('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);

    // Check if the editor has text content
    const contentState = state.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const hasText = rawContent.blocks.some((block) => block.text.trim().length > 0);

    // Update the content value
    setEditorContent(hasText ? JSON.stringify(rawContent) : '');

    // Clear errors if any
    if (errors.description && hasText) {
      setErrors({ ...errors, description: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      attachment?: string;
      price?: string;
      quantity?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Tên thiết bị là bắt buộc';
    }

    // Check if the editor has any content
    const contentState = editorState.getCurrentContent();
    const textLength = contentState.getPlainText().trim().length;
    const hasText = textLength > 0;

    if (!hasText) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!attachment) {
      newErrors.attachment = 'Hình ảnh là bắt buộc';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Giá phải là số dương';
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Số lượng phải là số nguyên dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Force getting the latest editor content before validation
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const hasText = rawContent.blocks.some((block) => block.text.trim().length > 0);
    setEditorContent(hasText ? JSON.stringify(rawContent) : '');

    if (!validateForm() || !attachment) return;

    setLoading(true);
    try {
      const deviceData: CreateDeviceRequest = {
        name,
        description: editorContent,
        attachment,
        price: Number(price),
        quantity: Number(quantity),
      };

      await deviceService.createDevice(deviceData);
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating device:', error);
      let errorMessage = 'Đã xảy ra lỗi khi tạo thiết bị';
      if (error.response?.data?.response?.message) {
        errorMessage = error.response.data.response.message;
      }
      setErrors({
        ...errors,
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachment(event.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thêm thiết bị mới</Typography>
          <IconButton onClick={loading ? undefined : handleClose} size="small" disabled={loading}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {errors.general && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errors.general}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Tên thiết bị"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.description}>
                <Typography variant="subtitle2" gutterBottom>
                  Mô tả
                </Typography>
                <Box
                  sx={{
                    border: (theme) =>
                      `1px solid ${errors.description ? theme.palette.error.main : theme.palette.divider}`,
                    borderRadius: 1,
                    minHeight: '150px',
                    bgcolor: 'background.paper',
                  }}
                >
                  <MUIRichTextEditor
                    ref={editorRef}
                    label="Nhập mô tả chi tiết..."
                    onChange={handleEditorChange}
                    inlineToolbar={true}
                    controls={[
                      'title',
                      'bold',
                      'italic',
                      'underline',
                      'strikethrough',
                      'link',
                      'numberList',
                      'bulletList',
                      'quote',
                      'clear',
                    ]}
                    readOnly={loading}
                  />
                </Box>
                {errors.description && <FormHelperText error>{errors.description}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth disabled={loading} sx={{ height: '56px' }}>
                {attachment ? attachment.name : 'Chọn hình ảnh'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {errors.attachment && <FormHelperText error>{errors.attachment}</FormHelperText>}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Giá"
                fullWidth
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                disabled={loading}
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số lượng"
                fullWidth
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={!!errors.quantity}
                helperText={errors.quantity}
                disabled={loading}
                InputProps={{
                  inputProps: { min: 1, step: 1 },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang tạo...' : 'Tạo thiết bị'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
