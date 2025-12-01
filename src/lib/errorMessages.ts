/**
 * User-Friendly Error Message Mapping
 * 
 * Provides specific, actionable error messages for common scenarios
 */

export const ErrorMessages = {
  // Authentication & Authorization
  UNAUTHORIZED: "You need to sign in to access this feature.",
  FORBIDDEN: "You don't have permission to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  
  // Item Operations
  ITEM_NOT_FOUND: "The requested item was not found.",
  ITEM_ALREADY_ISSUED: "This item is already issued to another person.",
  ITEM_NOT_ISSUED: "This item is not currently issued.",
  ITEM_ALREADY_EXISTS: "An item with this identifier already exists.",
  
  // Scale & Validation
  SCALE_EXCEEDED: "Cannot issue item: Soldier already has the maximum authorized quantity.",
  SCALE_WARNING: "Warning: Soldier is approaching the maximum authorized quantity.",
  RANK_REQUIRED: "Soldier rank is required to check clothing scale.",
  NO_SCALE_DEFINED: "No scale is defined for this item and rank. Issue at your discretion.",
  
  // Exchange Operations
  EXCHANGE_NOT_APPROVED: "Exchange must be approved before execution.",
  EXCHANGE_ALREADY_EXECUTED: "This exchange has already been executed.",
  EXCHANGE_ITEMS_ALREADY_RETURNED: "Some items have already been returned.",
  
  // Transaction Errors
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  
  // Validation Errors
  REQUIRED_FIELD_MISSING: "Please fill in all required fields.",
  INVALID_DATE: "Please enter a valid date.",
  INVALID_QUANTITY: "Quantity must be a positive number.",
  INVALID_SERVICE_NUMBER: "Please enter a valid service number.",
  
  // Form Errors
  FORM_INCOMPLETE: "Please complete all required fields before submitting.",
  FORM_VALIDATION_FAILED: "Please check your input and try again.",
  
  // File Upload
  FILE_TOO_LARGE: "File is too large. Please use a smaller file.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a supported file format.",
  FILE_UPLOAD_FAILED: "File upload failed. Please try again.",
  
  // General
  OPERATION_FAILED: "Operation failed. Please try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please contact support if this persists.",
  
  // Success Messages (for consistency)
  SUCCESS: "Operation completed successfully.",
  ITEM_ISSUED: "Item issued successfully.",
  ITEM_RETURNED: "Item returned successfully.",
  EXCHANGE_COMPLETED: "Exchange completed successfully.",
};

/**
 * Get error message by key
 */
export function getErrorMessage(key: keyof typeof ErrorMessages): string {
  return ErrorMessages[key] || ErrorMessages.UNEXPECTED_ERROR;
}

/**
 * Custom error messages with placeholders
 */
export function formatErrorMessage(
  template: string,
  ...args: (string | number)[]
): string {
  let message = template;
  args.forEach((arg, index) => {
    message = message.replace(`{${index}}`, String(arg));
  });
  return message;
}

