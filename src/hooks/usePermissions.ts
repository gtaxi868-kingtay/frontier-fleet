import { useAuth } from './useAuth';

export type Permission = 
  | 'view_all'
  | 'manage_inventory' 
  | 'manage_roles'
  | 'view_analytics'
  | 'generate_reports'
  | 'approve_transactions'
  | 'manage_explosives';

const rolePermissions: Record<string, Permission[]> = {
  CO: [
    'view_all',
    'manage_inventory',
    'manage_roles',
    'view_analytics',
    'generate_reports',
    'approve_transactions',
    'manage_explosives',
  ],
  S4: [
    'view_all',
    'manage_inventory',
    'manage_roles',
    'view_analytics',
    'generate_reports',
    'approve_transactions',
    'manage_explosives',
  ],
  OC: [
    'view_all',
    'manage_inventory',
    'view_analytics',
    'generate_reports',
    'approve_transactions',
  ],
  SQMS: [
    'view_all',
    'manage_inventory',
    'approve_transactions',
  ],
  Soldier: [
    'view_all',
  ],
};

export function usePermissions() {
  const { role } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const canManageInventory = hasPermission('manage_inventory');
  const canManageRoles = hasPermission('manage_roles');
  const canViewAnalytics = hasPermission('view_analytics');
  const canGenerateReports = hasPermission('generate_reports');
  const canManageExplosives = hasPermission('manage_explosives');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageInventory,
    canManageRoles,
    canViewAnalytics,
    canGenerateReports,
    canManageExplosives,
    role,
  };
}
