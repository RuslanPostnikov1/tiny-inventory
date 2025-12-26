/**
 * Low stock threshold - products with quantity below this are considered low stock
 */
export const LOW_STOCK_THRESHOLD = 10;

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Rate limiting settings
 */
export const RATE_LIMIT_TTL = 60000; // 1 minute
export const RATE_LIMIT_MAX = 100; // requests per TTL
