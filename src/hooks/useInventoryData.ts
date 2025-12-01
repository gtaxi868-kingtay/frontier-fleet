import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUnitFilter } from './useUnitFilter';

type TableName = 
  | 'weapons' 
  | 'vehicles' 
  | 'tools' 
  | 'engineer_equipment' 
  | 'plant_machinery'
  | 'mechanics_tools'
  | 'mt_facilities'
  | 'ppe'
  | 'uniforms'
  | 'explosives'
  | 'facilities'
  | 'works_materials'
  | 'general_inventory'
  | 'room_inventory';

// Map table names to their unit column names
const getUnitColumnName = (tableName: TableName): string | null => {
  const unitColumnMap: Record<string, string> = {
    weapons: 'squadron_id',
    vehicles: 'squadron_id',
    tools: 'squadron_id',
    engineer_equipment: 'squadron_id',
    plant_machinery: 'squadron_id',
    mechanics_tools: 'squadron_id',
    mt_facilities: 'squadron_id',
    ppe: 'squadron_id',
    uniforms: 'squadron_id',
    explosives: 'squadron_id',
    facilities: 'squadron_id',
    works_materials: 'unit_id',
    general_inventory: 'squadron_id',
    room_inventory: null, // Room inventory might not have unit column
  };
  return unitColumnMap[tableName] || null;
};

export function useInventoryData<T = any>(tableName: TableName) {
  const queryClient = useQueryClient();
  const { applyUnitFilter, canSeeAllUnits, userUnitId } = useUnitFilter();
  const unitColumn = getUnitColumnName(tableName);

  const query = useQuery({
    queryKey: [tableName, userUnitId, canSeeAllUnits],
    queryFn: async () => {
      // Build select query with relationships
      let selectQuery = '*';
      if (tableName === 'weapons') {
        selectQuery = '*, unit:units(name), issued_to_profile:profiles!weapons_issued_to_fkey(id, name, rank)';
      } else if (tableName === 'tools' || tableName === 'uniforms' || tableName === 'ppe' || tableName === 'engineer_equipment') {
        // Include issued_to profile for tables that can be issued
        selectQuery = '*, issued_to_profile:profiles!tools_issued_to_fkey(id, name, rank)';
        if (tableName === 'tools') {
          selectQuery = '*, issued_to_profile:profiles!tools_issued_to_fkey(id, name, rank)';
        } else if (tableName === 'uniforms') {
          selectQuery = '*, issued_to_profile:profiles!uniforms_issued_to_fkey(id, name, rank)';
        } else if (tableName === 'ppe') {
          selectQuery = '*, issued_to_profile:profiles!ppe_issued_to_fkey(id, name, rank)';
        } else if (tableName === 'engineer_equipment') {
          selectQuery = '*, issued_to_profile:profiles!engineer_equipment_issued_to_fkey(id, name, rank)';
        }
      }

      let queryBuilder = supabase
        .from(tableName)
        .select(selectQuery);

      // Apply unit filtering if column exists
      if (unitColumn) {
        queryBuilder = applyUnitFilter(queryBuilder, { columnName: unitColumn });
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as T[];
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast.success('Item added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast.success('Item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
