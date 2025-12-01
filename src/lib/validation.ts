/**
 * Centralized Validation Utilities
 * 
 * Provides validation functions for forms and data entry
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  errorMessages: string[];
}

/**
 * Validate date is not in the future
 */
export function validateDateNotFuture(date: string | Date): { valid: boolean; error?: string } {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (dateObj > today) {
    return {
      valid: false,
      error: 'Date cannot be in the future',
    };
  }
  
  return { valid: true };
}

/**
 * Validate date is not too far in the past (e.g., more than 10 years)
 */
export function validateDateNotTooOld(date: string | Date): { valid: boolean; error?: string } {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (dateObj < tenYearsAgo) {
    return {
      valid: false,
      error: 'Date is too far in the past (more than 10 years)',
    };
  }
  
  return { valid: true };
}

/**
 * Validate quantity is positive
 */
export function validateQuantity(quantity: number | string): { valid: boolean; error?: string } {
  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Quantity must be a number',
    };
  }
  
  if (num <= 0) {
    return {
      valid: false,
      error: 'Quantity must be greater than zero',
    };
  }
  
  if (num > 10000) {
    return {
      valid: false,
      error: 'Quantity is too large (maximum 10,000)',
    };
  }
  
  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
    };
  }
  
  return { valid: true };
}

/**
 * Validate service number format (alphanumeric, typically 6-10 characters)
 */
export function validateServiceNumber(serviceNumber: string): { valid: boolean; error?: string } {
  if (!serviceNumber) {
    return { valid: true }; // Optional field
  }
  
  const cleaned = serviceNumber.trim();
  if (cleaned.length < 3) {
    return {
      valid: false,
      error: 'Service number must be at least 3 characters',
    };
  }
  
  if (cleaned.length > 20) {
    return {
      valid: false,
      error: 'Service number is too long (maximum 20 characters)',
    };
  }
  
  // Allow alphanumeric and common separators
  const serviceNumberRegex = /^[A-Z0-9\-\/]+$/i;
  if (!serviceNumberRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Service number can only contain letters, numbers, hyphens, and slashes',
    };
  }
  
  return { valid: true };
}

/**
 * Validate date range (start date must be before end date)
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date
): { valid: boolean; error?: string } {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (start > end) {
    return {
      valid: false,
      error: 'Start date must be before or equal to end date',
    };
  }
  
  return { valid: true };
}

/**
 * Validate array is not empty
 */
export function validateArrayNotEmpty<T>(array: T[], fieldName: string): { valid: boolean; error?: string } {
  if (!array || array.length === 0) {
    return {
      valid: false,
      error: `At least one ${fieldName} must be selected`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate number is within range
 */
export function validateNumberRange(
  value: number | string,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a number`,
    };
  }
  
  if (num < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }
  
  if (num > max) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${max}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate text length
 */
export function validateTextLength(
  text: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (!text) {
    return { valid: true }; // Optional field
  }
  
  const length = text.trim().length;
  
  if (length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  
  if (length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate multiple fields at once
 */
export function validateFields(
  validations: Array<{ field: string; result: { valid: boolean; error?: string } }>
): ValidationResult {
  const errors: Record<string, string> = {};
  const errorMessages: string[] = [];
  
  validations.forEach(({ field, result }) => {
    if (!result.valid && result.error) {
      errors[field] = result.error;
      errorMessages.push(result.error);
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    errorMessages,
  };
}

/**
 * Validate exchange items are actually issued
 */
export async function validateExchangeItemsIssued(
  itemIds: string[]
): Promise<{ valid: boolean; errors: string[] }> {
  // This would typically query the database
  // For now, return a placeholder
  return {
    valid: itemIds.length > 0,
    errors: itemIds.length === 0 ? ['No items selected for exchange'] : [],
  };
}

