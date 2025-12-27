import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';
import { productsApi } from '../api/products';
import { storesApi } from '../api/stores';
import { handleApiError } from '../utils/error';
import {
  validateProductForm,
  errorsToRecord,
  type ProductFormData,
} from '../utils/validation';
import { MAX_LIMIT } from '../constants';

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  storeId?: string; // If provided, the product will be added to this store (hide store selector)
  onClose: () => void;
  onSave: () => void;
}

export default function ProductDialog({ open, product, storeId, onClose, onSave }: ProductDialogProps) {
  const isFixedStore = !!storeId && !product;
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    storeId: '',
  });
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);

  const loadStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const response = await storesApi.getAll(1, MAX_LIMIT);
      setStores(response.data);
    } catch {
      setApiError('Failed to load stores');
    } finally {
      setStoresLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      // Only load stores if we need to show the store selector
      if (!isFixedStore) {
        loadStores();
      }
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          price: Number(product.price),
          quantity: product.quantity,
          storeId: product.storeId,
        });
      } else {
        setFormData({
          name: '',
          category: '',
          price: 0,
          quantity: 0,
          storeId: storeId || '',
        });
      }
      setErrors({});
      setApiError(null);
    }
  }, [open, product, storeId, isFixedStore, loadStores]);

  const handleSubmit = async () => {
    const validationErrors = validateProductForm(formData);
    if (validationErrors.length > 0) {
      setErrors(errorsToRecord(validationErrors));
      return;
    }

    setLoading(true);
    setApiError(null);
    setErrors({});

    try {
      if (product) {
        const updateData: UpdateProductDto = {
          name: formData.name,
          category: formData.category,
          price: formData.price,
          quantity: formData.quantity,
          storeId: formData.storeId,
        };
        await productsApi.update(product.id, updateData);
      } else {
        const createData: CreateProductDto = formData;
        await productsApi.create(createData);
      }
      onSave();
    } catch (err) {
      setApiError(handleApiError(err, 'save product'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;

      if (field === 'price') {
        // Round to 2 decimal places
        const num = parseFloat(e.target.value);
        value = isNaN(num) ? 0 : Number(num.toFixed(2));
      } else if (field === 'quantity') {
        const num = parseInt(e.target.value, 10);
        value = isNaN(num) ? 0 : num;
      }

      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' });
      }
    };

  // Select all text on focus for numeric fields to replace default 0
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Product Name"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Category"
          type="text"
          fullWidth
          value={formData.category}
          onChange={handleChange('category')}
          error={!!errors.category}
          helperText={errors.category}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Price"
          type="number"
          fullWidth
          value={formData.price}
          onChange={handleChange('price')}
          onFocus={handleFocus}
          inputProps={{ min: 0, step: 0.01 }}
          error={!!errors.price}
          helperText={errors.price}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Quantity"
          type="number"
          fullWidth
          value={formData.quantity}
          onChange={handleChange('quantity')}
          onFocus={handleFocus}
          inputProps={{ min: 0, step: 1 }}
          error={!!errors.quantity}
          helperText={errors.quantity}
          disabled={loading}
        />
        {/* Only show store selector when editing or when storeId is not fixed */}
        {!isFixedStore && (
          <TextField
            select
            margin="dense"
            label="Store"
            fullWidth
            value={formData.storeId}
            onChange={handleChange('storeId')}
            error={!!errors.storeId}
            helperText={errors.storeId}
            disabled={loading || storesLoading}
          >
            {storesLoading ? (
              <MenuItem disabled>Loading stores...</MenuItem>
            ) : (
              stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))
            )}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || storesLoading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
