import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScaleCheckResult {
  allowed: boolean;
  current: number;
  max: number;
  warning?: string;
  scaleInfo?: {
    id: string;
    rank: string;
    item_name: string;
    quantity_authorized: number;
    life_expectancy_months?: number;
    category?: string;
  };
}

/**
 * Hook to check clothing scale availability for a soldier and item
 */
export function useClothingScale() {
  /**
   * Check if a soldier can be issued an item based on clothing scale
   * @param soldierId - Soldier's profile ID
   * @param soldierRank - Soldier's rank
   * @param itemName - Name of the item to issue
   * @param quantity - Quantity to issue (default 1)
   * @returns Promise with scale check result
   */
  const checkScaleAvailability = async (
    soldierId: string,
    soldierRank: string | null,
    itemName: string,
    quantity: number = 1
  ): Promise<ScaleCheckResult> => {
    if (!soldierRank) {
      return {
        allowed: false,
        current: 0,
        max: 0,
        warning: "Soldier rank is required to check scale",
      };
    }

    try {
      // Get scale for this rank and item
      const { data: scaleData, error: scaleError } = await supabase
        .from("clothing_equipment_scale")
        .select("*")
        .eq("rank", soldierRank)
        .eq("item_name", itemName)
        .eq("scale_type", "regular") // Default to regular scale
        .single();

      if (scaleError || !scaleData) {
        // No scale defined - allow but warn
        return {
          allowed: true,
          current: 0,
          max: 0,
          warning: `No scale defined for ${soldierRank} - ${itemName}. Issue at your discretion.`,
        };
      }

      const maxAllowed = scaleData.quantity_authorized || 0;

      // Get current holdings (non-returned items)
      const { data: currentIssues, error: issuesError } = await supabase
        .from("clothing_equipment_issues")
        .select("id, quantity_issued, return_date")
        .eq("soldier_id", soldierId)
        .eq("item_name", itemName)
        .is("return_date", null); // Only count non-returned items

      if (issuesError) {
        console.error("Error fetching current issues:", issuesError);
      }

      const current = (currentIssues || []).reduce(
        (sum, issue) => sum + (issue.quantity_issued || 1),
        0
      );

      const newTotal = current + quantity;
      const percentageUsed = maxAllowed > 0 ? (current / maxAllowed) * 100 : 0;

      // Determine if allowed
      const allowed = newTotal <= maxAllowed;

      // Generate warning if near limit
      let warning: string | undefined;
      if (!allowed) {
        warning = `Cannot issue: Soldier already has ${current} of ${itemName} (max: ${maxAllowed}). Would exceed scale by ${newTotal - maxAllowed}.`;
      } else if (percentageUsed >= 80 && percentageUsed < 100) {
        warning = `Warning: Soldier has ${current}/${maxAllowed} items (${Math.round(percentageUsed)}% of scale).`;
      } else if (newTotal === maxAllowed) {
        warning = `Soldier will be at maximum scale (${maxAllowed}/${maxAllowed}) after this issue.`;
      }

      return {
        allowed,
        current,
        max: maxAllowed,
        warning,
        scaleInfo: {
          id: scaleData.id,
          rank: scaleData.rank,
          item_name: scaleData.item_name,
          quantity_authorized: scaleData.quantity_authorized,
          life_expectancy_months: scaleData.life_expectancy_months || undefined,
          category: scaleData.category || undefined,
        },
      };
    } catch (error: any) {
      console.error("Error checking scale:", error);
      return {
        allowed: false,
        current: 0,
        max: 0,
        warning: `Error checking scale: ${error.message}`,
      };
    }
  };

  /**
   * Get all scale entries for a specific rank
   */
  const getScaleForRank = async (rank: string) => {
    const { data, error } = await supabase
      .from("clothing_equipment_scale")
      .select("*")
      .eq("rank", rank)
      .eq("scale_type", "regular")
      .order("item_name");

    if (error) throw error;
    return data || [];
  };

  /**
   * Get current holdings for a soldier (all items)
   */
  const getSoldierHoldings = async (soldierId: string) => {
    const { data, error } = await supabase
      .from("clothing_equipment_issues")
      .select(`
        *,
        item_name,
        quantity_issued,
        issue_date,
        return_date
      `)
      .eq("soldier_id", soldierId)
      .is("return_date", null) // Only active issues
      .order("issue_date", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return {
    checkScaleAvailability,
    getScaleForRank,
    getSoldierHoldings,
  };
}

/**
 * Hook version for use in components
 */
export function useClothingScaleCheck(
  soldierId: string | null,
  soldierRank: string | null,
  itemName: string | null,
  quantity: number = 1,
  enabled: boolean = true
) {
  const { checkScaleAvailability } = useClothingScale();
  
  return useQuery({
    queryKey: ["clothing-scale-check", soldierId, soldierRank, itemName, quantity],
    queryFn: async () => {
      if (!soldierId || !soldierRank || !itemName) {
        return {
          allowed: false,
          current: 0,
          max: 0,
          warning: "Missing required information",
        } as ScaleCheckResult;
      }

      return await checkScaleAvailability(soldierId, soldierRank, itemName, quantity);
    },
    enabled: enabled && !!soldierId && !!soldierRank && !!itemName,
    staleTime: 30000, // Cache for 30 seconds
  });
}

