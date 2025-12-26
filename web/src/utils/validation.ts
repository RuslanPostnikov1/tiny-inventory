import {
  MAX_NAME_LENGTH,
  MAX_ADDRESS_LENGTH,
  MAX_CATEGORY_LENGTH,
} from '../constants';

export interface ValidationError {
  field: string;
  message: string;
}

export interface StoreFormData {
  name: string;
  address: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  storeId: string;
}

/**
 * Validates store form data
 */
export function validateStoreForm(data: StoreFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Store name is required' });
  } else if (data.name.length > MAX_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `Store name must be less than ${MAX_NAME_LENGTH} characters`,
    });
  }

  if (!data.address.trim()) {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if (data.address.length > MAX_ADDRESS_LENGTH) {
    errors.push({
      field: 'address',
      message: `Address must be less than ${MAX_ADDRESS_LENGTH} characters`,
    });
  }

  return errors;
}

/**
 * Validates product form data
 */
export function validateProductForm(data: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Product name is required' });
  } else if (data.name.length > MAX_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `Product name must be less than ${MAX_NAME_LENGTH} characters`,
    });
  }

  if (!data.category.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (data.category.length > MAX_CATEGORY_LENGTH) {
    errors.push({
      field: 'category',
      message: `Category must be less than ${MAX_CATEGORY_LENGTH} characters`,
    });
  }

  if (data.price < 0) {
    errors.push({ field: 'price', message: 'Price must be a positive number' });
  }

  if (data.quantity < 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be a positive number' });
  }

  if (!Number.isInteger(data.quantity)) {
    errors.push({ field: 'quantity', message: 'Quantity must be a whole number' });
  }

  if (!data.storeId) {
    errors.push({ field: 'storeId', message: 'Store is required' });
  }

  return errors;
}

/**
 * Converts validation errors array to a record for easy field lookup
 */
export function errorsToRecord(errors: ValidationError[]): Record<string, string> {
  return errors.reduce(
    (acc, error) => {
      acc[error.field] = error.message;
      return acc;
    },
    {} as Record<string, string>,
  );
}

