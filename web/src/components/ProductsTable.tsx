import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Box,
  Chip,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import type { Product, ProductFilters, SortField, SortOrder, StockStatus } from '../types';
import ProductDialog from './ProductDialog';
import ConfirmDialog from './ConfirmDialog';
import Notification from './Notification';
import { productsApi } from '../api/products';
import { handleApiError } from '../utils/error';
import { formatCurrency } from '../utils/format';
import { LOW_STOCK_THRESHOLD } from '../constants';

interface ProductsTableProps {
  products: Product[];
  categories: string[];
  filters: ProductFilters;
  storeId?: string; // If provided, new products will be added to this store
  onFiltersChange: (filters: ProductFilters) => void;
  onUpdate: () => void;
}

export default function ProductsTable({
  products,
  categories,
  filters,
  storeId,
  onFiltersChange,
  onUpdate,
}: ProductsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Sorting state - synced with filters
  const sortField: SortField = (filters.sortBy as SortField) || 'name';
  const sortOrder: SortOrder = filters.sortOrder || 'asc';

  // Local state for inputs (apply on Enter)
  const [localSearch, setLocalSearch] = useState<string>(filters.search ?? '');
  const [localMinPrice, setLocalMinPrice] = useState<string>(
    filters.minPrice?.toString() ?? '',
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    filters.maxPrice?.toString() ?? '',
  );

  // Optimistic UI state for deleted products
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<Set<string>>(new Set());

  // Sync local state with filters prop
  useEffect(() => {
    setLocalSearch(filters.search ?? '');
    setLocalMinPrice(filters.minPrice?.toString() ?? '');
    setLocalMaxPrice(filters.maxPrice?.toString() ?? '');
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingProductId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;

    // Optimistic update - immediately hide the product
    setOptimisticallyDeleted((prev) => new Set(prev).add(deletingProductId));
    setDeleteDialogOpen(false);

    setDeleteLoading(true);
    try {
      await productsApi.delete(deletingProductId);
      // Remove only this product from optimistic state (not all)
      setOptimisticallyDeleted((prev) => {
        const next = new Set(prev);
        next.delete(deletingProductId);
        return next;
      });
      setNotification({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success',
      });
      onUpdate();
    } catch (err) {
      // Rollback optimistic update on error
      setOptimisticallyDeleted((prev) => {
        const next = new Set(prev);
        next.delete(deletingProductId);
        return next;
      });
      setNotification({
        open: true,
        message: handleApiError(err, 'delete product'),
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
      setDeletingProductId(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    handleCloseDialog();
    setNotification({
      open: true,
      message: editingProduct ? 'Product updated successfully' : 'Product created successfully',
      severity: 'success',
    });
    onUpdate();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newFilters = { ...filters };
      if (localSearch.trim()) {
        newFilters.search = localSearch.trim();
      } else {
        delete newFilters.search;
      }
      onFiltersChange(newFilters);
    }
  };

  const handleStockStatusChange = (value: StockStatus | '') => {
    const newFilters = { ...filters };
    if (value) {
      newFilters.stockStatus = value;
    } else {
      delete newFilters.stockStatus;
    }
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters.category = value;
    } else {
      delete newFilters.category;
    }
    onFiltersChange(newFilters);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newFilters = { ...filters };
      const minPrice = localMinPrice ? Number(localMinPrice) : undefined;
      const maxPrice = localMaxPrice ? Number(localMaxPrice) : undefined;

      if (minPrice !== undefined) {
        newFilters.minPrice = minPrice;
      } else {
        delete newFilters.minPrice;
      }
      if (maxPrice !== undefined) {
        newFilters.maxPrice = maxPrice;
      } else {
        delete newFilters.maxPrice;
      }
      onFiltersChange(newFilters);
    }
  };

  const handleSort = (field: SortField) => {
    const newOrder: SortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({
      ...filters,
      sortBy: field,
      sortOrder: newOrder,
    });
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onFiltersChange({});
  };

  // Check if any filter is active
  const hasActiveFilters =
    !!filters.search ||
    !!filters.stockStatus ||
    !!filters.category ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'error';
    if (quantity < LOW_STOCK_THRESHOLD) return 'warning';
    return 'success';
  };

  const getStockLabel = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < LOW_STOCK_THRESHOLD) return 'Low Stock';
    return 'In Stock';
  };

  // Filter out optimistically deleted products
  const visibleProducts = products.filter((p) => !optimisticallyDeleted.has(p.id));

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          size="small"
          placeholder="Press Enter"
          sx={{ flex: '1 1 180px', minWidth: 180 }}
        />
        <TextField
          select
          label="Category"
          value={filters.category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          size="small"
          sx={{ flex: '1 1 150px', minWidth: 150 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Min Price"
          type="number"
          value={localMinPrice}
          onChange={(e) => setLocalMinPrice(e.target.value)}
          onKeyDown={handlePriceKeyDown}
          size="small"
          inputProps={{ min: 0 }}
          placeholder="Enter"
          sx={{ flex: '1 1 100px', minWidth: 100 }}
        />
        <TextField
          label="Max Price"
          type="number"
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(e.target.value)}
          onKeyDown={handlePriceKeyDown}
          size="small"
          inputProps={{ min: 0 }}
          placeholder="Enter"
          sx={{ flex: '1 1 100px', minWidth: 100 }}
        />
        <TextField
          select
          label="Stock Status"
          value={filters.stockStatus || ''}
          onChange={(e) => handleStockStatusChange(e.target.value as StockStatus | '')}
          size="small"
          sx={{ flex: '1 1 140px', minWidth: 140 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="in_stock">In Stock</MenuItem>
          <MenuItem value="low_stock">Low Stock</MenuItem>
          <MenuItem value="out_of_stock">Out of Stock</MenuItem>
        </TextField>
        <Tooltip title="Reset filters">
          <span>
            <IconButton
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              color="default"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <ClearIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortField === 'category'}
                  direction={sortField === 'category' ? sortOrder : 'asc'}
                  onClick={() => handleSort('category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortField === 'price'}
                  direction={sortField === 'price' ? sortOrder : 'asc'}
                  onClick={() => handleSort('price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortField === 'quantity'}
                  direction={sortField === 'quantity' ? sortOrder : 'asc'}
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Stock Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              visibleProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStockLabel(product.quantity)}
                      color={getStockColor(product.quantity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit product">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete product">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(product.id)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductDialog
        open={dialogOpen}
        product={editingProduct}
        storeId={storeId}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingProductId(null);
        }}
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
