import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  | 'room_inventory'
  | 'alerts'
  | 'user_roles';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionProps {
  table: TableName;
  event?: RealtimeEvent;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

/**
 * Custom hook for subscribing to real-time database changes
 * Automatically handles subscription cleanup on unmount
 * 
 * @example
 * useRealtimeSubscription({
 *   table: 'weapons',
 *   event: '*',
 *   onChange: (payload) => {
 *     console.log('Change detected:', payload);
 *     refetchData();
 *   }
 * });
 */
export function useRealtimeSubscription({
  table,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeSubscriptionProps) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = () => {
      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes' as any,
          {
            event: event,
            schema: 'public',
            table: table,
          },
          (payload: any) => {
            console.log(`[Realtime] ${table} change detected:`, payload);
            
            // Call the generic onChange handler
            if (onChange) {
              onChange(payload);
            }

            // Call specific event handlers based on payload event type
            const eventType = payload.eventType || payload.event;
            if (eventType === 'INSERT' && onInsert) {
              onInsert(payload);
            } else if (eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload);
            } else if (eventType === 'DELETE' && onDelete) {
              onDelete(payload);
            }
          }
        )
        .subscribe((status) => {
          console.log(`[Realtime] ${table} subscription status:`, status);
        });
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log(`[Realtime] Cleaning up ${table} subscription`);
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, onInsert, onUpdate, onDelete, onChange]);
}
