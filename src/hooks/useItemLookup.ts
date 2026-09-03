import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryModule, getIdField } from '@/lib/qr-utils';
import { toast } from 'sonner';

export interface LookupResult {
  module: InventoryModule;
  item: any;
  found: boolean;
}

export function useItemLookup() {
  const [isSearching, setIsSearching] = useState(false);

  const lookupItem = async (module: InventoryModule, itemId: string): Promise<LookupResult> => {
    setIsSearching(true);
    
    try {
      const idField = getIdField(module);

      // weapons.serial_number must never ride along in a lookup fetch —
      // same reasoning as useInventoryData's weapons select. QR-scanning a
      // weapon shouldn't be a side channel around the PIN-gated reveal.
      const selectQuery =
        module === 'weapons'
          ? 'id,weapon_id,weapon_type,squadron_id,issued_to,issue_date,return_date,condition_issue,serviceable,last_inspection_date,next_inspection_due,survey_report_filed,notes,created_at,updated_at,rack_number,store_location,service_number,rank,name,mag_amount,page_64_no'
          : '*';

      const { data, error } = await supabase
        .from(module as any)
        .select(selectQuery)
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
