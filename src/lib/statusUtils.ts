/**
 * Status utility functions for consistent status display across the application
 */

export type StatusType = 'availability' | 'serviceability' | 'inspection' | 'work_ticket';

/**
 * Get the badge variant for a given status
 */
export function getStatusVariant(
  status: string | null | undefined,
  type: StatusType
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) return 'outline';
  
  const normalized = status.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  switch (type) {
    case 'availability':
      if (normalized.includes('available') || normalized === 'in_store') return 'default';
      if (normalized.includes('issued') || normalized === 'out') return 'secondary';
      if (normalized.includes('reserved')) return 'outline';
      return 'outline';
      
    case 'serviceability':
      if (normalized.includes('serviceable') || normalized === 'good') return 'default';
      if (normalized.includes('unserviceable') || normalized.includes('poor')) return 'destructive';
      if (normalized.includes('repair')) return 'outline';
      return 'outline';
      
    case 'inspection':
      if (normalized.includes('completed')) return 'default';
      if (normalized.includes('overdue')) return 'destructive';
      if (normalized.includes('pending')) return 'secondary';
      return 'outline';
      
    case 'work_ticket':
      if (normalized === 'active') return 'default';
      if (normalized === 'completed') return 'secondary';
      if (normalized === 'cancelled') return 'outline';
      return 'outline';
      
    default:
      return 'outline';
  }
}

/**
 * Get a human-readable label for a status
 */
export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  
  // Handle common variations
  const normalized = status.toLowerCase().trim();
  
  // Serviceability variants
  if (normalized === 'serviceable' || normalized === 'good' || normalized === 'excellent') {
    return 'Serviceable';
  }
  if (normalized === 'unserviceable' || normalized === 'poor' || normalized === 'bad') {
    return 'Unserviceable';
  }
  if (normalized.includes('repair')) {
    return 'Under Repair';
  }
  
  // Availability variants
  if (normalized === 'available' || normalized === 'in_store') {
    return 'Available';
  }
  if (normalized === 'issued' || normalized === 'out') {
    return 'Issued';
  }
  if (normalized === 'reserved') {
    return 'Reserved';
  }
  
  // Capitalize first letter of each word
  return status
    .split(/[_\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format issued_to profile information
 */
export function formatIssuedTo(profile: any): string {
  if (!profile) return 'N/A';
  
  const parts: string[] = [];
  if (profile.rank) parts.push(profile.rank);
  if (profile.name) parts.push(profile.name);
  
  return parts.length > 0 ? parts.join(' ') : 'N/A';
}

/**
 * Determine status based on item properties
 */
export function getItemStatus(item: any): {
  status: string;
  type: StatusType;
} {
  // Check if item is issued
  if (item.issued_to) {
    return { status: 'issued', type: 'availability' };
  }
  
  // Check serviceability
  if (item.serviceable === false || item.serviceability === 'Unserviceable') {
    return { status: 'unserviceable', type: 'serviceability' };
  }
  
  // Default to available/serviceable
  return { status: 'available', type: 'availability' };
}

