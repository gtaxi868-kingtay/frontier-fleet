import { useAuth } from './useAuth';

type UnitFilterOptions = {
  columnName?: string; // Column name for unit filter (default: 'squadron_id')
  includeDepartments?: boolean; // Whether to include department data
};

/**
 * Hook to determine unit-based filtering based on user role
 * CO/S4/S4_ADMIN/MTO/WKSP_WO see all units, others see only their unit
 * Department roles (MTO, WKSP_WO) operate across all units
 */
export function useUnitFilter() {
  const { profile, role } = useAuth();
  
  // MTO and WKSP_WO see all units for their department operations
  const canSeeAllUnits = role === 'CO' || role === 'S4' || role === 'S4_ADMIN' || role === 'MTO' || role === 'WKSP_WO';
  const userUnitId = profile?.unit_id || null;

  /**
   * Get unit filter query builder helper
   */
  const getUnitFilter = (options: UnitFilterOptions = {}) => {
    const { columnName = 'squadron_id' } = options;
    
    if (canSeeAllUnits) {
      // Command roles see all units - return no filter
      return null;
    }
    
    // Others see only their unit
    if (!userUnitId) {
      // If user has no unit, return empty result filter
      return { [columnName]: '__NO_UNIT__' };
    }
    
    return { [columnName]: userUnitId };
  };

  /**
   * Apply unit filter to a Supabase query
   */
  const applyUnitFilter = <T extends { eq: (column: string, value: any) => any }>(
    query: T,
    options: UnitFilterOptions = {}
  ): T => {
    const filter = getUnitFilter(options);
    
    if (!filter || canSeeAllUnits) {
      return query;
    }
    
    const { columnName = 'squadron_id' } = options;
    
    if (!userUnitId) {
      // Return query that will return no results
      return query.eq(columnName, '__NO_UNIT__') as T;
    }
    
    return query.eq(columnName, userUnitId) as T;
  };

  /**
   * Check if current user can see all units
   */
  const hasFullAccess = canSeeAllUnits;

  /**
   * Get current user's unit ID
   */
  const currentUnitId = userUnitId;

  return {
    canSeeAllUnits,
    userUnitId,
    getUnitFilter,
    applyUnitFilter,
    hasFullAccess,
    currentUnitId,
  };
}

