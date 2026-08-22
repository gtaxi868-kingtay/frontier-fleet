import { useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';

type UnitFilterOptions = {
  columnName?: string; // Column name for unit filter (default: 'squadron_id')
  includeDepartments?: boolean; // Whether to include department data
};

/**
 * Hook to determine unit-based filtering based on user role
 * CO/S4/S4_ADMIN/MTO/WKSP_WO see all units, others see only their unit.
 * Command roles (canSeeAllUnits) can additionally scope to one specific
 * store via a `?unit=<unitId>` URL param (set by the Stores pages) — this
 * override is ignored for unit-scoped roles, who always see only their own
 * unit regardless of the URL.
 */
export function useUnitFilter() {
  const { profile, role } = useAuth();
  const [searchParams] = useSearchParams();
  const overrideUnitId = searchParams.get('unit');

  // MTO and WKSP_WO see all units for their department operations
  const canSeeAllUnits = role === 'CO' || role === 'S4' || role === 'S4_ADMIN' || role === 'MTO' || role === 'WKSP_WO';
  const userUnitId = profile?.unit_id || null;

  // Command roles honor the store-scope override; unit-scoped roles never do.
  const effectiveUnitId = canSeeAllUnits ? overrideUnitId : userUnitId;

  /**
   * Get unit filter query builder helper
   */
  const getUnitFilter = (options: UnitFilterOptions = {}) => {
    const { columnName = 'squadron_id' } = options;

    if (canSeeAllUnits && !overrideUnitId) {
      // Command roles with no store scope selected - see all units
      return null;
    }

    if (!effectiveUnitId) {
      // Unit-scoped user with no unit assigned - return empty result filter
      return { [columnName]: '__NO_UNIT__' };
    }

    return { [columnName]: effectiveUnitId };
  };

  /**
   * Apply unit filter to a Supabase query
   */
  const applyUnitFilter = <T extends { eq: (column: string, value: any) => any }>(
    query: T,
    options: UnitFilterOptions = {}
  ): T => {
    const filter = getUnitFilter(options);

    if (!filter) {
      return query;
    }

    const { columnName = 'squadron_id' } = options;

    if (!effectiveUnitId) {
      // Return query that will return no results
      return query.eq(columnName, '__NO_UNIT__') as T;
    }

    return query.eq(columnName, effectiveUnitId) as T;
  };

  /**
   * Check if current user can see all units (and has no store scope selected)
   */
  const hasFullAccess = canSeeAllUnits && !overrideUnitId;

  /**
   * Get the unit ID currently in effect for filtering (own unit, store-scope
   * override, or null when a command role is viewing everything)
   */
  const currentUnitId = effectiveUnitId;

  return {
    canSeeAllUnits,
    userUnitId,
    overrideUnitId,
    getUnitFilter,
    applyUnitFilter,
    hasFullAccess,
    currentUnitId,
  };
}
