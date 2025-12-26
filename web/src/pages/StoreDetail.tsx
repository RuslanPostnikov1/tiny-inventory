import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Pagination,
  Tooltip,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { storesApi } from '../api/stores';
import { productsApi } from '../api/products';
import type { Store, StoreStats, Product } from '../types';
import ProductsTable from '../components/ProductsTable';
import ProductDialog from '../components/ProductDialog';
import StoreDialog from '../components/StoreDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import { handleApiError } from '../utils/error';
import { formatCurrency } from '../utils/format';
import { DEFAULT_LIMIT } from '../constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { useFiltersSync } from '../hooks/useFiltersSync';

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data state
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and filters - synced with URL
  const { filters, page, setFilters, setPage } = useFiltersSync();
  const [totalPages, setTotalPages] = useState(1);

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Set page title
  usePageTitle(store?.name || 'Store Details');

  const loadStore = useCallback(async () => {
    if (!id) return;
    try {
      const [storeData, statsData] = await Promise.all([
        storesApi.getById(id),
        storesApi.getStats(id),
      ]);
      setStore(storeData);
      setStats(statsData);
    } catch (err) {
      setError(handleApiError(err, 'load store details'));
    }
  }, [id]);

  const loadProducts = useCallback(async () => {
    if (!id) return;
    try {
      const response = await productsApi.getAll({
        storeId: id,
        page,
        limit: DEFAULT_LIMIT,
        ...filters,
      });
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(handleApiError(err, 'load products'));
    }
  }, [id, page, filters]);

  // Initial load of store data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      await loadStore();
      setLoading(false);
    };
    loadInitialData();
  }, [loadStore]);

  // Load products separately (doesn't cause full page re-render)
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await storesApi.delete(id);
      navigate('/stores');
    } catch (err) {
      setNotification({
        open: true,
        message: handleApiError(err, 'delete store'),
        severity: 'error',
      });
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSave = () => {
    setEditDialogOpen(false);
    setNotification({
      open: true,
      message: 'Store updated successfully',
      severity: 'success',
    });
    loadStore();
  };

  const handleProductsUpdate = async () => {
    await loadProducts();
    loadStore(); // Reload stats
  };

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      // Page reset is handled by setFilters (clears page param)
    },
    [setFilters]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !store) {
    return (
      <Box>
        <IconButton onClick={() => navigate('/stores')} aria-label="Back to stores">
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Store not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Back to stores">
            <IconButton onClick={() => navigate('/stores')} aria-label="Back to stores">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            {store.name}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Edit store">
            <IconButton color="primary" onClick={() => setEditDialogOpen(true)} aria-label="Edit store">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete store">
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)} aria-label="Delete store">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Store Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>Address:</strong> {store.address}
        </Typography>
      </Paper>

      {stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Inventory Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Categories
                  </Typography>
                  <Typography variant="h4">{stats.categorySummary.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Items
                  </Typography>
                  <Typography variant="h4">{stats.totalProducts}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" color={stats.lowStockCount > 0 ? 'error' : 'inherit'}>
                    {stats.lowStockCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Inventory Value
                  </Typography>
                  <Typography variant="h4">{formatCurrency(stats.totalInventoryValue)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {stats.categorySummary.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                By Category
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {stats.categorySummary.map((cat) => (
                  <Chip
                    key={cat.category}
                    label={`${cat.category} (${cat.count})`}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Products</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddProductDialogOpen(true)}
          >
            Add Product
          </Button>
        </Box>
        <ProductsTable
          products={products}
          categories={stats?.categorySummary.map((c) => c.category) || []}
          filters={filters}
          storeId={id}
          onFiltersChange={handleFiltersChange}
          onUpdate={handleProductsUpdate}
        />
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      <ProductDialog
        open={addProductDialogOpen}
        product={null}
        storeId={id}
        onClose={() => setAddProductDialogOpen(false)}
        onSave={() => {
          setAddProductDialogOpen(false);
          setNotification({
            open: true,
            message: 'Product added successfully',
            severity: 'success',
          });
          handleProductsUpdate();
        }}
      />

      <StoreDialog
        open={editDialogOpen}
        store={store}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Store?"
        message="Are you sure you want to delete this store? This will also delete all products associated with it. This action cannot be undone."
        confirmText="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
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
