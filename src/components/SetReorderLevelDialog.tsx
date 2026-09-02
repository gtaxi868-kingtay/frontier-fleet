import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowDownWideNarrow } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSensitiveUnlock } from "@/hooks/useSensitiveUnlock";
import { toast } from "sonner";

interface SetReorderLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any; // general_inventory row
}

// Reorder level sets the low-stock trigger threshold for an item — a
// unit-wide policy value, not routine stock handling — so it goes through
// the same session-level PIN/password re-auth as other sensitive actions
// (useSensitiveUnlock), rather than a one-off confirm dialog of its own.
export function SetReorderLevelDialog({ open, onOpenChange, onSuccess, item }: SetReorderLevelDialogProps) {
  const { unlocked, unlock } = useSensitiveUnlock();
  const [level, setLevel] = useState(String(item?.reorder_level ?? 0));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setLevel(String(item?.reorder_level ?? 0));
  }, [open, item?.id]);

  const reset = () => {
    setPassword("");
    setError("");
  };

  const saveLevel = async () => {
    if (!item) return;
    const parsed = parseInt(level, 10);
    if (isNaN(parsed) || parsed < 0) {
      setError("Enter a whole number of 0 or more");
      return;
    }
    setSubmitting(true);
    setError("");
    const { error: updateError } = await supabase
      .from("general_inventory")
      .update({ reorder_level: parsed })
      .eq("id", item.id);
    setSubmitting(false);
    if (updateError) {
      toast.error(updateError.message || "Failed to update reorder level");
      return;
    }
    toast.success(`Reorder level for ${item.item_name || item.item_id} set to ${parsed}`);
    reset();
    onOpenChange(false);
    onSuccess();
  };

  const handleUnlockThenSave = async () => {
    if (!password) return;
    setSubmitting(true);
    setError("");
    const res = await unlock(password, `general_inventory:reorder_level:${item?.id}`);
    if (!res.success) {
      setSubmitting(false);
      setError(res.error || "Failed to unlock");
      return;
    }
    setPassword("");
    await saveLevel();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownWideNarrow className="h-4 w-4" />
            Set Reorder Level
          </DialogTitle>
          <DialogDescription>
            {item ? `${item.item_name || item.item_id}${item.item_name ? ` (${item.item_id})` : ""}` : ""} — items
            at or below this quantity trigger a low-stock alert for the unit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reorder-level">Reorder Level</Label>
            <Input
              id="reorder-level"
              type="number"
              min={0}
              inputMode="numeric"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              autoFocus={unlocked}
            />
          </div>

          {!unlocked && (
            <div className="space-y-2 border-t pt-4">
              <Label className="flex items-center gap-2 text-sm">
                <Lock className="h-3.5 w-3.5" />
                Confirm your Password / PIN
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlockThenSave()}
                autoFocus
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          {unlocked ? (
            <Button onClick={saveLevel} disabled={submitting}>
              Save
            </Button>
          ) : (
            <Button onClick={handleUnlockThenSave} disabled={submitting || !password}>
              {submitting ? "Verifying..." : "Confirm & Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
