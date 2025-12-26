import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { storesApi } from '../api/stores';
import type { Store } from '../types';
import StoreDialog from '../components/StoreDialog';
import Notification from '../components/Notification';
import { DEFAULT_LIMIT } from '../constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { handleApiError } from '../utils/error';

export default function StoresList() {
  usePageTitle('Stores');

  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storesApi.getAll(page, DEFAULT_LIMIT);
      setStores(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(handleApiError(err, 'load stores'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleSave = () => {
    setDialogOpen(false);
    setNotification({
      open: true,
      message: 'Store created successfully',
      severity: 'success',
    });
    loadStores();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Stores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Store
        </Button>
      </Box>

      {stores.length === 0 ? (
        <Alert severity="info">No stores found. Create your first store!</Alert>
      ) : (
        <>
          <Grid container spacing={3} justifyContent="center">
            {stores.map((store) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={store.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {store.address}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                      Items: {store._count?.products || 0}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/stores/${store.id}`)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <StoreDialog
        open={dialogOpen}
        store={null}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
}
