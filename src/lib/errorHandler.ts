/**
 * Centralized Error Handling System
 * 
 * Provides user-friendly error messages and standardized error processing
 */

import { PostgrestError } from "@supabase/supabase-js";

export interface ErrorContext {
  operation?: string;
  module?: string;
  itemId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Known error patterns and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  "Failed to fetch": "Network connection failed. Please check your internet connection and try again.",
  "Network request failed": "Unable to connect to server. Please try again.",
  
  // Database constraint errors
  "duplicate key value": "This record already exists. Please use a unique identifier.",
  "foreign key constraint": "Cannot perform this operation. Related data is in use.",
  "violates unique constraint": "A record with this information already exists.",
  "violates not-null constraint": "Required information is missing. Please fill in all required fields.",
  
  // Permission errors
  "permission denied": "You don't have permission to perform this action. Contact your administrator.",
  "new row violates row-level security": "Access denied. You don't have permission for this operation.",
  
  // Validation errors
  "invalid input": "The information entered is not valid. Please check and try again.",
  "invalid date": "The date entered is not valid. Please use a valid date format.",
  
  // Not found errors
  "no rows returned": "The requested item was not found.",
  
  // Generic Supabase errors
  "PGRST116": "The requested item was not found.",
  "23505": "A record with this information already exists.",
  "23503": "Cannot delete or update. This record is referenced by other data.",
  "23502": "Required field is missing.",
};

/**
 * Parse Supabase error into user-friendly message
 */
export function parseSupabaseError(error: PostgrestError | Error | unknown): string {
  if (!error) return "An unexpected error occurred.";

  // Handle PostgrestError
  if (typeof error === 'object' && 'code' in error && 'message' in error) {
    const pgError = error as PostgrestError;
    const errorCode = pgError.code;
    const errorMessage = pgError.message?.toLowerCase() || "";

    // Check for specific error codes
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }

    // Check for error patterns in message
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(pattern.toLowerCase())) {
        return message;
      }
    }

    // Return original message if it's user-friendly
    if (pgError.message && pgError.message.length < 200) {
      return pgError.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const errorMessage = error.message?.toLowerCase() || "";
    
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(pattern.toLowerCase())) {
        return message;
      }
    }

    return error.message || "An unexpected error occurred.";
  }

  // Handle string errors
  if (typeof error === 'string') {
    const errorLower = error.toLowerCase();
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (errorLower.includes(pattern.toLowerCase())) {
        return message;
      }
    }
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Get detailed error information for debugging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
} {
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && 'message' in error) {
      const pgError = error as PostgrestError;
      return {
        message: parseSupabaseError(error),
        code: pgError.code,
        details: pgError.details || undefined,
        hint: pgError.hint || undefined,
      };
    }
    
    if (error instanceof Error) {
      return {
        message: parseSupabaseError(error),
      };
    }
  }

  return {
    message: parseSupabaseError(error),
  };
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const errorStr = JSON.stringify(error).toLowerCase();
    
    // Network errors are retryable
    if (errorStr.includes('network') || 
        errorStr.includes('fetch') || 
        errorStr.includes('timeout') ||
        errorStr.includes('connection')) {
      return true;
    }

    // Database connection errors
    if (errorStr.includes('connection') || 
        errorStr.includes('socket') ||
        errorStr.includes('econnrefused')) {
      return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('timeout') ||
           message.includes('connection');
  }

  return false;
}

/**
 * Get error severity level
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (typeof error === 'object' && error !== null) {
    const errorStr = JSON.stringify(error).toLowerCase();
    
    // Critical: Data loss or security issues
    if (errorStr.includes('delete') && errorStr.includes('constraint') ||
        errorStr.includes('unauthorized') ||
        errorStr.includes('forbidden')) {
      return 'critical';
    }

    // High: Important operations failed
    if (errorStr.includes('permission') ||
        errorStr.includes('security') ||
        errorStr.includes('constraint')) {
      return 'high';
    }

    // Medium: Data issues
    if (errorStr.includes('duplicate') ||
        errorStr.includes('not found') ||
        errorStr.includes('invalid')) {
      return 'medium';
    }
  }

  return 'low';
}

/**
 * Format error with context for user display
 */
export function formatErrorForUser(
  error: unknown,
  context?: ErrorContext
): string {
  let message = parseSupabaseError(error);
  
  if (context?.operation) {
    message = `${context.operation} failed: ${message}`;
  }

  return message;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const errorStr = JSON.stringify(error).toLowerCase();
    return errorStr.includes('invalid') ||
           errorStr.includes('validation') ||
           errorStr.includes('required') ||
           errorStr.includes('constraint');
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('invalid') ||
           message.includes('validation') ||
           message.includes('required');
  }

  return false;
}

