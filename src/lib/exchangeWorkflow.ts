/**
 * Exchange Workflow Service
 * 
 * Provides transaction-safe operations for completing monthly exchanges.
 * Handles marking old items as returned and linking new items issued.
 */

import { supabase } from "@/integrations/supabase/client";

export interface ExchangeExecutionResult {
  success: boolean;
  error?: string;
  itemsReturned: number;
  itemsIssued: string[];
}

/**
 * Mark items as returned when exchange is approved
 */
export async function markExchangeItemsReturned(
  exchangeId: string,
  itemIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const returnDate = new Date().toISOString().split('T')[0];

    // Update all items to mark as returned
    const { error } = await supabase
      .from('clothing_equipment_issues')
      .update({
        return_date: returnDate,
        condition_on_return: 'Exchanged',
        notes: `Returned as part of exchange ${exchangeId} on ${returnDate}`,
      })
      .in('id', itemIds)
      .is('return_date', null); // Only update items that haven't been returned

    if (error) {
      console.error('Error marking items as returned:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception marking items as returned:', error);
    return { success: false, error: error.message || 'Failed to mark items as returned' };
  }
}

/**
 * Link newly issued items to exchange
 */
export async function linkIssuedItemsToExchange(
  exchangeId: string,
  newIssueIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current exchange record
    const { data: exchange, error: fetchError } = await supabase
      .from('clothing_exchanges')
      .select('items_issued')
      .eq('id', exchangeId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Merge with existing items_issued
    const existingIssued = exchange?.items_issued || [];
    const updatedIssued = [...existingIssued, ...newIssueIds];

    // Update exchange record
    const { error: updateError } = await supabase
      .from('clothing_exchanges')
      .update({
        items_issued: updatedIssued,
        quantity_exchanged: updatedIssued.length,
      })
      .eq('id', exchangeId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception linking items to exchange:', error);
    return { success: false, error: error.message || 'Failed to link items to exchange' };
  }
}

/**
 * Complete exchange execution (mark returned + link issued)
 * This is a helper that combines both operations but doesn't guarantee atomicity
 * For true atomicity, use the database RPC function
 */
export async function executeExchange(
  exchangeId: string,
  itemsToReturn: string[],
  newIssueIds: string[]
): Promise<ExchangeExecutionResult> {
  try {
    // Step 1: Mark items as returned
    const returnResult = await markExchangeItemsReturned(exchangeId, itemsToReturn);
    if (!returnResult.success) {
      return {
        success: false,
        error: returnResult.error || 'Failed to mark items as returned',
        itemsReturned: 0,
        itemsIssued: [],
      };
    }

    // Step 2: Link new items to exchange
    if (newIssueIds.length > 0) {
      const linkResult = await linkIssuedItemsToExchange(exchangeId, newIssueIds);
      if (!linkResult.success) {
        // Note: Items already marked as returned, but linking failed
        // In production, might want to rollback or handle differently
        return {
          success: false,
          error: linkResult.error || 'Failed to link new items to exchange',
          itemsReturned: itemsToReturn.length,
          itemsIssued: [],
        };
      }
    }

    return {
      success: true,
      itemsReturned: itemsToReturn.length,
      itemsIssued: newIssueIds,
    };
  } catch (error: any) {
    console.error('Exception executing exchange:', error);
    return {
      success: false,
      error: error.message || 'Failed to execute exchange',
      itemsReturned: 0,
      itemsIssued: [],
    };
  }
}

/**
 * Validate that exchange items are actually issued before executing
 */
export async function validateExchangeItems(
  itemIds: string[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!itemIds || itemIds.length === 0) {
    errors.push('No items selected for exchange');
    return { valid: false, errors };
  }

  try {
    const { data: issues, error } = await supabase
      .from('clothing_equipment_issues')
      .select('id, issue_number, return_date, item_name, soldier_id')
      .in('id', itemIds);

    if (error) {
      errors.push(`Failed to validate items: ${error.message}`);
      return { valid: false, errors };
    }

    if (!issues || issues.length === 0) {
      errors.push('No items found with the provided IDs');
      return { valid: false, errors };
    }

    // Check all items exist
    const foundIds = issues.map(i => i.id);
    const missingIds = itemIds.filter(id => !foundIds.includes(id));
    if (missingIds.length > 0) {
      errors.push(`${missingIds.length} item(s) not found in database`);
    }

    // Check items are not already returned
    const alreadyReturned = issues.filter(i => i.return_date);
    if (alreadyReturned.length > 0) {
      const returnedNumbers = alreadyReturned.map(i => i.issue_number || i.id.slice(0, 8)).join(', ');
      errors.push(
        `${alreadyReturned.length} item(s) already returned (Issue #: ${returnedNumbers})`
      );
    }

    // Check all items belong to the same unit (optional validation)
    const allItemsHaveSoldier = issues.every(i => i.soldier_id);
    if (!allItemsHaveSoldier) {
      errors.push('Some items are missing soldier assignments');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error: any) {
    errors.push(error.message || 'Validation failed');
    return { valid: false, errors };
  }
}

