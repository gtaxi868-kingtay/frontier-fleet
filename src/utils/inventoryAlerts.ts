import { supabase } from '@/integrations/supabase/client';

/**
 * Trigger inventory alerts check manually
 * This calls the inventory-alerts edge function to scan all inventory
 * for conditions requiring alerts (low stock, overdue inspections, etc.)
 */
export async function triggerInventoryAlertsCheck() {
  try {
    console.log('[Inventory Alerts] Triggering manual check...');
    
    const { data, error } = await supabase.functions.invoke('inventory-alerts', {
      body: {},
    });

    if (error) {
      console.error('[Inventory Alerts] Error:', error);
      throw error;
    }

    console.log('[Inventory Alerts] Check complete:', data);
    return data;
  } catch (error) {
    console.error('[Inventory Alerts] Failed to trigger check:', error);
    throw error;
  }
}

/**
 * Set up automated inventory alerts checking
 * This should be called when the app initializes for admin users
 * It will periodically check inventory conditions every hour
 */
export function setupAutomatedInventoryAlerts() {
  // Check immediately on setup
  triggerInventoryAlertsCheck();

  // Set up periodic checking every hour
  const intervalId = setInterval(() => {
    triggerInventoryAlertsCheck();
  }, 60 * 60 * 1000); // 1 hour

  // Return cleanup function
  return () => clearInterval(intervalId);
}
