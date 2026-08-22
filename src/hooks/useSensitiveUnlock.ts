import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "sensitive_unlocked";

// Session-level re-authentication for weapon serials / ammunition detail.
// Re-entering the password/PIN confirms the person at the keyboard right
// now is who they claim to be, distinct from the underlying role-based
// access already granted by RLS. Unlocks once per browser session (cleared
// on sign-out), not per page/item — matches how the battalion wants this
// to feel: a deliberate but infrequent confirmation, not a constant nag.
export function useSensitiveUnlock() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "true");

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(STORAGE_KEY);
      setUnlocked(false);
    }
  }, [user]);

  const unlock = useCallback(
    async (password: string, context: string): Promise<{ success: boolean; error?: string }> => {
      if (!user?.email) {
        return { success: false, error: "Not signed in" };
      }

      const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
      if (error) {
        return { success: false, error: "Incorrect password/PIN" };
      }

      await supabase.from("sensitive_unlock_log").insert({ user_id: user.id, context });

      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
      return { success: true };
    },
    [user]
  );

  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  }, []);

  return { unlocked, unlock, lock };
}
