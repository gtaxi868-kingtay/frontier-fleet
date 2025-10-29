import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';

interface RealtimeInventorySyncProps {
  module: 
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
  onDataChange: () => void;
  showToasts?: boolean;
}

/**
 * Component that handles real-time synchronization for inventory modules
 * Automatically refetches data when changes are detected
 * Optionally shows toast notifications for updates
 */
export function RealtimeInventorySync({ 
  module, 
  onDataChange, 
  showToasts = false 
}: RealtimeInventorySyncProps) {
  const { toast } = useToast();

  useRealtimeSubscription({
    table: module,
    event: '*',
    onInsert: (payload) => {
      if (showToasts) {
        toast({
          title: 'New Item Added',
          description: `A new ${module.replace('_', ' ')} item was added.`,
        });
      }
      onDataChange();
    },
    onUpdate: (payload) => {
      if (showToasts) {
        toast({
          title: 'Item Updated',
          description: `An ${module.replace('_', ' ')} item was updated.`,
        });
      }
      onDataChange();
    },
    onDelete: (payload) => {
      if (showToasts) {
        toast({
          title: 'Item Deleted',
          description: `An ${module.replace('_', ' ')} item was deleted.`,
          variant: 'destructive',
        });
      }
      onDataChange();
    },
  });

  // This component doesn't render anything
  return null;
}
