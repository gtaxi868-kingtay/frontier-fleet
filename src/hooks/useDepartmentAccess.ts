import { useAuth } from './useAuth';
import { useUnitFilter } from './useUnitFilter';

type DepartmentType = 'MT' | 'Workshop' | 'POL';

interface DepartmentAccess {
  canAccessMT: boolean;
  canAccessWorkshop: boolean;
  canAccessPOL: boolean;
  canManageMT: boolean;
  canManageWorkshop: boolean;
  mtDepartment: null;
  workshopDepartment: null;
  polDepartment: null;
  userDepartmentAssignment: null;
}

/**
 * Hook to determine department-based access control
 * - MTO: Full MT access (all units)
 * - WKSP_WO: Full Workshop access (all units)
 * - Support OC: View MT data (read-only)
 * - EME OC: View Workshop data (read-only)
 * - CO, S4, S4_ADMIN: Full access to all departments
 */
export function useDepartmentAccess() {
  const { role } = useAuth();
  const { canSeeAllUnits } = useUnitFilter();

  // Check if user can view department data
  const canViewDepartment = (deptType: DepartmentType): boolean => {
    if (canSeeAllUnits) return true; // CO, S4, S4_ADMIN see all
    
    if (role === 'MTO' && deptType === 'MT') return true;
    if (role === 'MTO' && deptType === 'POL') return true;
    if (role === 'WKSP_WO' && deptType === 'Workshop') return true;
    
    return false;
  };

  // Check if user can manage department data
  const canManageDepartment = (deptType: DepartmentType): boolean => {
    if (canSeeAllUnits) return true; // CO, S4, S4_ADMIN can manage all
    
    if (role === 'MTO' && (deptType === 'MT' || deptType === 'POL')) return true;
    if (role === 'WKSP_WO' && deptType === 'Workshop') return true;
    
    // OCs have view-only access
    return false;
  };

  const access: DepartmentAccess = {
    canAccessMT: canViewDepartment('MT'),
    canAccessWorkshop: canViewDepartment('Workshop'),
    canAccessPOL: canViewDepartment('POL'),
    canManageMT: canManageDepartment('MT'),
    canManageWorkshop: canManageDepartment('Workshop'),
    mtDepartment: null,
    workshopDepartment: null,
    polDepartment: null,
    userDepartmentAssignment: null,
  };

  return access;
}
