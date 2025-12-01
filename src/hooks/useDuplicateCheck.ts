import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface DuplicateCheckResult {
  exists: boolean;
  available: boolean;
  suggestedId?: string;
}

/**
 * Table name mappings for each module
 */
const MODULE_TABLE_MAP: Record<string, string> = {
  tools: 'tools',
  uniforms: 'uniforms',
  ppe: 'ppe',
  weapons: 'weapons',
  vehicles: 'vehicles',
  engineer_equipment: 'engineer_equipment',
  plant_machinery: 'plant_machinery',
  explosives: 'explosives',
  facilities: 'facilities',
  works_materials: 'works_materials',
  general_inventory: 'general_inventory',
  mechanics_tools: 'mechanics_tools',
  mt_facilities: 'mt_facilities',
  room_inventory: 'room_inventory',
};

/**
 * ID field mappings for each module
 */
const MODULE_ID_FIELD_MAP: Record<string, string> = {
  tools: 'tool_id',
  uniforms: 'uniform_id',
  ppe: 'ppe_id',
  weapons: 'weapon_id',
  vehicles: 'vehicle_id',
  engineer_equipment: 'equip_id',
  plant_machinery: 'plant_id',
  explosives: 'explosive_id',
  facilities: 'facility_id',
  works_materials: 'voucher_id',
  general_inventory: 'item_id',
  mechanics_tools: 'tool_id',
  mt_facilities: 'facility_id',
  room_inventory: 'room_id',
};

/**
 * Hook to check for duplicate IDs in real-time
 */
export function useDuplicateCheck(
  module: string,
  idValue: string,
  enabled: boolean = true,
  unitId?: string | null
) {
  const tableName = MODULE_TABLE_MAP[module];
  const idField = MODULE_ID_FIELD_MAP[module];

  const { data: checkResult, isLoading } = useQuery({
    queryKey: ['duplicate-check', module, idValue, unitId],
    queryFn: async (): Promise<DuplicateCheckResult> => {
      if (!idValue || !tableName || !idField) {
        return { exists: false, available: true };
      }

      let query = supabase
        .from(tableName)
        .select(idField)
        .eq(idField, idValue)
        .limit(1);

      // Filter by unit if provided
      if (unitId) {
        const unitField = module === 'works_materials' || module === 'clothing_equipment_issues' 
          ? 'unit_id' 
          : 'squadron_id';
        query = query.eq(unitField, unitId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Duplicate check error:', error);
        return { exists: false, available: true }; // Assume available on error
      }

      const exists = data && data.length > 0;

      // Generate suggested ID if exists
      let suggestedId: string | undefined;
      if (exists) {
        suggestedId = await generateNextAvailableId(module, idValue, unitId);
      }

      return {
        exists,
        available: !exists,
        suggestedId,
      };
    },
    enabled: enabled && !!idValue && idValue.trim().length > 0,
    staleTime: 0, // Always check fresh
  });

  return {
    exists: checkResult?.exists ?? false,
    available: checkResult?.available ?? true,
    suggestedId: checkResult?.suggestedId,
    isLoading,
  };
}

/**
 * Generate next available ID based on pattern
 */
async function generateNextAvailableId(
  module: string,
  baseId: string,
  unitId?: string | null
): Promise<string> {
  const tableName = MODULE_TABLE_MAP[module];
  const idField = MODULE_ID_FIELD_MAP[module];

  if (!tableName || !idField) return baseId;

  try {
    // Extract prefix and number pattern
    const match = baseId.match(/^(.+?)(\d+)$/);
    if (!match) {
      // If no number pattern, try to append -001
      return `${baseId}-001`;
    }

    const [, prefix, numberStr] = match;
    const baseNumber = parseInt(numberStr, 10);

    // Search for next available ID (check up to 1000 variations)
    for (let i = 1; i <= 1000; i++) {
      const candidateNumber = baseNumber + i;
      const candidateId = `${prefix}${String(candidateNumber).padStart(numberStr.length, '0')}`;

      let query = supabase
        .from(tableName)
        .select(idField)
        .eq(idField, candidateId)
        .limit(1);

      // Filter by unit if provided
      if (unitId) {
        const unitField = module === 'works_materials' || module === 'clothing_equipment_issues'
          ? 'unit_id'
          : 'squadron_id';
        query = query.eq(unitField, unitId);
      }

      const { data } = await query;

      if (!data || data.length === 0) {
        return candidateId;
      }
    }

    // Fallback: append timestamp
    return `${baseId}-${Date.now().toString().slice(-4)}`;
  } catch (error) {
    console.error('Error generating next ID:', error);
    return `${baseId}-001`;
  }
}

/**
 * Standalone function to check duplicate (for use in validators)
 */
export async function checkDuplicateId(
  module: string,
  idValue: string,
  unitId?: string | null
): Promise<boolean> {
  const tableName = MODULE_TABLE_MAP[module];
  const idField = MODULE_ID_FIELD_MAP[module];

  if (!idValue || !tableName || !idField) {
    return false;
  }

  let query = supabase
    .from(tableName)
    .select(idField)
    .eq(idField, idValue)
    .limit(1);

  // Filter by unit if provided
  if (unitId) {
    const unitField = module === 'works_materials' || module === 'clothing_equipment_issues'
      ? 'unit_id'
      : 'squadron_id';
    query = query.eq(unitField, unitId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Duplicate check error:', error);
    return false; // Assume not duplicate on error
  }

  return data && data.length > 0;
}

/**
 * Debounced duplicate check hook for real-time validation
 */
export function useDebouncedDuplicateCheck(
  module: string,
  idValue: string,
  enabled: boolean = true,
  unitId?: string | null,
  debounceMs: number = 500
) {
  const [debouncedValue, setDebouncedValue] = useState(idValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(idValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [idValue, debounceMs]);

  return useDuplicateCheck(module, debouncedValue, enabled, unitId);
}

