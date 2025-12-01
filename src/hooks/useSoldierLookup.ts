import { supabase } from '@/integrations/supabase/client';

interface SoldierProfile {
  id: string;
  name: string;
  rank: string | null;
  unit_id: string | null;
  service_number?: string | null;
}

interface SoldierLookupResult {
  found: boolean;
  profile: SoldierProfile | null;
  matchedFields: string[];
}

/**
 * Lookup soldier profile by service_number, rank, and/or name
 */
export async function lookupSoldier(
  service_number?: string | null,
  rank?: string | null,
  name?: string | null
): Promise<SoldierLookupResult> {
  if (!service_number && !rank && !name) {
    return { found: false, profile: null, matchedFields: [] };
  }

  try {
    let query = supabase
      .from('profiles')
      .select('id, name, rank, unit_id')
      .limit(1);

    // Try to match by service_number first (if we have a service_number column in profiles)
    // For now, we'll match by name and rank combination
    if (name && rank) {
      query = query
        .ilike('name', `%${name.trim()}%`)
        .eq('rank', rank.trim());
    } else if (name) {
      query = query.ilike('name', `%${name.trim()}%`);
    } else if (rank) {
      query = query.eq('rank', rank.trim());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error looking up soldier:', error);
      return { found: false, profile: null, matchedFields: [] };
    }

    if (data && data.length > 0) {
      const matchedFields: string[] = [];
      const profile = data[0] as SoldierProfile;
      
      if (name && profile.name?.toLowerCase().includes(name.toLowerCase())) {
        matchedFields.push('name');
      }
      if (rank && profile.rank === rank) {
        matchedFields.push('rank');
      }

      return {
        found: true,
        profile,
        matchedFields,
      };
    }

    return { found: false, profile: null, matchedFields: [] };
  } catch (error) {
    console.error('Error in soldier lookup:', error);
    return { found: false, profile: null, matchedFields: [] };
  }
}

/**
 * Hook for soldier lookup functionality
 */
export function useSoldierLookup() {
  return {
    lookupSoldier,
  };
}

