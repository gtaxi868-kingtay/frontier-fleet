import { useAuth } from './useAuth';
import { useUnitFilter } from './useUnitFilter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type DepartmentType = 'MT' | 'Workshop' | 'POL';

interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  parent_unit_id: string | null;
  operating_unit_id: string | null;
}

interface DepartmentAccess {
  canAccessMT: boolean;
  canAccessWorkshop: boolean;
  canAccessPOL: boolean;
  canManageMT: boolean;
  canManageWorkshop: boolean;
  mtDepartment: Department | null;
  workshopDepartment: Department | null;
  polDepartment: Department | null;
  userDepartmentAssignment: Department | null;
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
  const { role, profile } = useAuth();
  const { canSeeAllUnits, userUnitId } = useUnitFilter();

  // Fetch user's department assignments
  const { data: departmentAssignments } = useQuery({
    queryKey: ['department_assignments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data, error } = await supabase
        .from('department_assignments')
        .select('*, department:departments(*)')
        .eq('user_id', profile.id);
      
      if (error) {
        console.error('Error fetching department assignments:', error);
        return null;
      }
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch all departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching departments:', error);
        return [];
      }
      return (data || []) as Department[];
    },
  });

  // Get department by type
  const getDepartmentByType = (type: DepartmentType): Department | null => {
    if (!departments) return null;
    return departments.find(d => d.type === type) || null;
  };

  // Get user's assigned department
  const getUserDepartment = (): Department | null => {
    if (!departmentAssignments || departmentAssignments.length === 0) return null;
    const assignment = departmentAssignments[0];
    return assignment?.department || null;
  };

  // Check if user has department role
  const hasDepartmentRole = (deptType: DepartmentType): boolean => {
    if (!role) return false;
    
    if (deptType === 'MT') {
      return role === 'MTO' || canSeeAllUnits;
    }
    
    if (deptType === 'Workshop') {
      return role === 'WKSP_WO' || canSeeAllUnits;
    }
    
    if (deptType === 'POL') {
      return role === 'MTO' || canSeeAllUnits; // POL is part of MT
    }
    
    return false;
  };

  // Check if user can view department data
  const canViewDepartment = (deptType: DepartmentType): boolean => {
    if (canSeeAllUnits) return true; // CO, S4, S4_ADMIN see all
    
    if (role === 'MTO' && deptType === 'MT') return true;
    if (role === 'MTO' && deptType === 'POL') return true;
    if (role === 'WKSP_WO' && deptType === 'Workshop') return true;
    
    // Support OC can view MT
    if (role === 'OC' && deptType === 'MT') {
      // Check if user's unit is Support Squadron
      if (departments) {
        const mtDept = getDepartmentByType('MT');
        if (mtDept && mtDept.parent_unit_id === userUnitId) return true;
      }
    }
    
    // EME OC can view Workshop
    if (role === 'OC' && deptType === 'Workshop') {
      if (departments) {
        const workshopDept = getDepartmentByType('Workshop');
        if (workshopDept && workshopDept.parent_unit_id === userUnitId) return true;
      }
    }
    
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

  const mtDepartment = getDepartmentByType('MT');
  const workshopDepartment = getDepartmentByType('Workshop');
  const polDepartment = getDepartmentByType('POL');
  const userDepartmentAssignment = getUserDepartment();

  const access: DepartmentAccess = {
    canAccessMT: canViewDepartment('MT'),
    canAccessWorkshop: canViewDepartment('Workshop'),
    canAccessPOL: canViewDepartment('POL'),
    canManageMT: canManageDepartment('MT'),
    canManageWorkshop: canManageDepartment('Workshop'),
    mtDepartment,
    workshopDepartment,
    polDepartment,
    userDepartmentAssignment,
  };

  return access;
}

