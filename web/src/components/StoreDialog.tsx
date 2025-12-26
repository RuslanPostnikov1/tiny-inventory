import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import type { Store, CreateStoreDto, UpdateStoreDto } from '../types';
import { storesApi } from '../api/stores';
import { handleApiError } from '../utils/error';
import {
  validateStoreForm,
  errorsToRecord,
  type StoreFormData,
} from '../utils/validation';

interface StoreDialogProps {
  open: boolean;
  store: Store | null;
  onClose: () => void;
  onSave: () => void;
}

export default function StoreDialog({ open, store, onClose, onSave }: StoreDialogProps) {
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (store) {
        setFormData({
          name: store.name,
          address: store.address,
        });
      } else {
        setFormData({ name: '', address: '' });
      }
      setErrors({});
      setApiError(null);
    }
  }, [open, store]);

  const handleSubmit = async () => {
    const validationErrors = validateStoreForm(formData);
    if (validationErrors.length > 0) {
      setErrors(errorsToRecord(validationErrors));
      return;
    }

    setLoading(true);
    setApiError(null);
    setErrors({});

    try {
      if (store) {
        const updateData: UpdateStoreDto = {
          name: formData.name,
          address: formData.address,
        };
        await storesApi.update(store.id, updateData);
      } else {
        const createData: CreateStoreDto = {
          name: formData.name,
          address: formData.address,
        };
        await storesApi.create(createData);
      }
      onSave();
    } catch (err) {
      setApiError(handleApiError(err, 'save store'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StoreFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{store ? 'Edit Store' : 'Create New Store'}</DialogTitle>
      <DialogContent>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Store Name"
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
          label="Address"
          type="text"
          fullWidth
          value={formData.address}
          onChange={handleChange('address')}
          error={!!errors.address}
          helperText={errors.address}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {store ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

