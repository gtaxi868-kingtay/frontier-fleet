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
