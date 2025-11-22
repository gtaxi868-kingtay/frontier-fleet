import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryModule } from '@/lib/qr-utils';
import { toast } from 'sonner';

export interface LookupResult {
  module: InventoryModule;
  item: any;
  found: boolean;
}

// ID field mappings for each module
const getIdField = (module: InventoryModule): string => {
  switch (module) {
    case 'weapons': return 'weapon_id';
    case 'tools': return 'tool_id';
    case 'vehicles': return 'vehicle_id';
    case 'engineer_equipment': return 'equip_id';
    case 'plant_machinery': return 'plant_id';
    case 'mechanics_tools': return 'tool_id';
    case 'mt_facilities': return 'facility_id';
    case 'ppe': return 'ppe_id';
    case 'uniforms': return 'uniform_id';
    case 'explosives': return 'explosive_id';
    case 'facilities': return 'facility_id';
    case 'works_materials': return 'voucher_id';
    case 'general_inventory': return 'item_id';
    case 'room_inventory': return 'room_id';
    default: return 'id';
  }
};

export function useItemLookup() {
  const [isSearching, setIsSearching] = useState(false);

  const lookupItem = async (module: InventoryModule, itemId: string): Promise<LookupResult> => {
    setIsSearching(true);
    
    try {
      const idField = getIdField(module);
      
      const { data, error } = await supabase
        .from(module as any)
        .select('*')
        .eq(idField, itemId)
        .maybeSingle();

      if (error) {
        console.error('Lookup error:', error);
        toast.error(`Failed to lookup item: ${error.message}`);
        return { module, item: null, found: false };
      }

      if (!data) {
        toast.error(`Item not found: ${itemId} in ${module}`);
        return { module, item: null, found: false };
      }

      toast.success(`Item found: ${itemId}`);
      return { module, item: data, found: true };
    } catch (error) {
      console.error('Lookup error:', error);
      toast.error('Failed to lookup item');
      return { module, item: null, found: false };
    } finally {
      setIsSearching(false);
    }
  };

  return {
    lookupItem,
    isSearching,
  };
}
