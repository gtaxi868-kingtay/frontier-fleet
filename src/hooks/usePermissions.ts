import { useAuth } from './useAuth';

export type Permission = 
  | 'view_all'
  | 'view_own_unit'
  | 'view_own_items'
  | 'manage_inventory' 
  | 'manage_roles'
  | 'revoke_roles'
  | 'view_analytics'
  | 'generate_reports'
  | 'approve_transactions'
  | 'approve_weapon_transfers'
  | 'manage_explosives'
  | 'bulk_upload'
  | 'edit_serviceability'
  | 'issue_items'
  | 'return_items'
  | 'create_requests'
  | 'approve_requests'
  | 'escalate_reports'
  | 'daily_oversight'
  | 'final_authority';

export type ViewScope = 'all_units' | 'own_unit' | 'own_issued_items';

interface RolePermissionConfig {
  permissions: Permission[];
  viewScope: ViewScope;
  canEditInventory: boolean;
  canApproveWeaponTransfers: boolean;
}

const rolePermissions: Record<string, RolePermissionConfig> = {
  CO: {
    permissions: [
      'view_all',
      'revoke_roles',
      'view_analytics',
      'generate_reports',
      'approve_transactions',
      'approve_weapon_transfers',
      'manage_explosives',
      'approve_requests',
      'final_authority',
    ],
    viewScope: 'all_units',
    canEditInventory: false, // CO doesn't directly edit
    canApproveWeaponTransfers: true,
  },
  RSM: {
    permissions: [
      'view_all',
      'view_analytics',
      'generate_reports',
    ],
    viewScope: 'all_units',
    canEditInventory: false,
    canApproveWeaponTransfers: false,
  },
  S1: {
    permissions: [
      'view_all',
      'view_analytics',
      'generate_reports',
    ],
    viewScope: 'all_units',
    canEditInventory: false,
    canApproveWeaponTransfers: false,
  },
  S4: {
    permissions: [
      'view_all',
      'manage_inventory',
      'revoke_roles',
      'view_analytics',
      'generate_reports',
      'approve_transactions',
      'approve_weapon_transfers',
      'manage_explosives',
      'bulk_upload',
      'edit_serviceability',
      'approve_requests',
    ],
    viewScope: 'all_units',
    canEditInventory: true,
    canApproveWeaponTransfers: true,
  },
  S4_ADMIN: {
    permissions: [
      'view_all',
      'manage_inventory',
      'view_analytics',
      'generate_reports',
      'approve_transactions',
      'bulk_upload',
      'edit_serviceability',
    ],
    viewScope: 'all_units',
    canEditInventory: true,
    canApproveWeaponTransfers: false,
  },
  OC: {
    permissions: [
      'view_own_unit',
      'view_analytics',
      'generate_reports',
      'create_requests',
      'approve_transactions',
      'approve_weapon_transfers',
      'daily_oversight',
    ],
    viewScope: 'own_unit',
    canEditInventory: false,
    canApproveWeaponTransfers: true,
  },
  SQMS: {
    permissions: [
      'view_own_unit',
      'manage_inventory',
      'create_requests',
      'escalate_reports',
      'edit_serviceability',
    ],
    viewScope: 'own_unit',
    canEditInventory: true,
    canApproveWeaponTransfers: false, // Cannot approve weapon transfers
  },
  STOREMAN: {
    permissions: [
      'view_own_unit',
      'issue_items',
      'return_items',
      'edit_serviceability',
      'escalate_reports',
    ],
    viewScope: 'own_unit',
    canEditInventory: true,
    canApproveWeaponTransfers: false,
  },
  Soldier: {
    permissions: [
      'view_own_items',
    ],
    viewScope: 'own_issued_items',
    canEditInventory: false,
    canApproveWeaponTransfers: false,
  },
  MTO: {
    permissions: [
      'view_all', // MT operates independently but needs to see all unit data for vehicle management
      'manage_inventory', // Vehicle and MT equipment management
      'view_analytics',
      'generate_reports',
      'edit_serviceability',
      'issue_items',
      'return_items',
    ],
    viewScope: 'all_units', // MTO needs visibility across units for vehicle pool management
    canEditInventory: true,
    canApproveWeaponTransfers: false,
  },
  WKSP_WO: {
    permissions: [
      'view_all', // Workshop services all units
      'manage_inventory', // Equipment repair and maintenance
      'view_analytics',
      'generate_reports',
      'edit_serviceability',
      'create_requests',
      'escalate_reports',
    ],
    viewScope: 'all_units', // Workshop handles equipment from all units
    canEditInventory: true,
    canApproveWeaponTransfers: false,
  },
};

export function usePermissions() {
  const { role } = useAuth();

  const getRoleConfig = (): RolePermissionConfig | null => {
    if (!role) return null;
    return rolePermissions[role] || null;
  };

  const hasPermission = (permission: Permission): boolean => {
    const config = getRoleConfig();
    if (!config) return false;
    return config.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const getViewScope = (): ViewScope => {
    const config = getRoleConfig();
    return config?.viewScope || 'own_issued_items';
  };

  const canEditInventory = (): boolean => {
    const config = getRoleConfig();
    return config?.canEditInventory || false;
  };

  const canApproveWeaponTransfers = (): boolean => {
    const config = getRoleConfig();
    return config?.canApproveWeaponTransfers || false;
  };

  // Specific permission checks
  const canManageInventory = hasPermission('manage_inventory');
  const canRevokeRoles = hasPermission('revoke_roles');
  const canViewAnalytics = hasPermission('view_analytics');
  const canGenerateReports = hasPermission('generate_reports');
  const canManageExplosives = hasPermission('manage_explosives');
  const canBulkUpload = hasPermission('bulk_upload');
  const canEditServiceability = hasPermission('edit_serviceability');
  const canIssueItems = hasPermission('issue_items');
  const canReturnItems = hasPermission('return_items');
  const canCreateRequests = hasPermission('create_requests');
  const canApproveRequests = hasPermission('approve_requests');
  const hasFinalAuthority = hasPermission('final_authority');

  // Role type checks
  const isCommandRole = role && ['CO', 'S1', 'S4', 'S4_ADMIN'].includes(role);
  const isUnitRole = role && ['OC', 'SQMS', 'STOREMAN'].includes(role);
  const isDepartmentRole = role && ['MTO', 'WKSP_WO'].includes(role);
  const canViewAllUnits = getViewScope() === 'all_units';
  const canViewOwnUnit = getViewScope() === 'own_unit' || getViewScope() === 'all_units';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getViewScope,
    canEditInventory: canEditInventory(),
    canApproveWeaponTransfers: canApproveWeaponTransfers(),
    
    // Permission flags
    canManageInventory,
    canRevokeRoles,
    canViewAnalytics,
    canGenerateReports,
    canManageExplosives,
    canBulkUpload,
    canEditServiceability,
    canIssueItems,
    canReturnItems,
    canCreateRequests,
    canApproveRequests,
    hasFinalAuthority,
    
    // Role type flags
    isCommandRole,
    isUnitRole,
    isDepartmentRole,
    canViewAllUnits,
    canViewOwnUnit,
    
    role,
  };
}
