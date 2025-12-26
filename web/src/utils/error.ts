/**
 * Extracts error message from various error types
 */
export function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: string | string[] }).message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    return message;
  }

  return fallback;
}

/**
 * Centralized error handler for API calls
 * Logs error to console and returns user-friendly message
 */
export function handleApiError(error: unknown, context: string): string {
  const message = extractErrorMessage(error, `Failed to ${context}`);
  
  // Log for debugging (in production this would go to a monitoring service)
  if (import.meta.env.DEV) {
    console.error(`[API Error] ${context}:`, error);
  }
  
  return message;
}

