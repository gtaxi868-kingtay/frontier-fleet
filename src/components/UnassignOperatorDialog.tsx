import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getItemDisplayId, getItemDisplayName } from "@/lib/itemDisplay";

interface UnassignOperatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any; // plant_machinery row, must have operator_assigned set
  module: string;
}

export function UnassignOperatorDialog({ open, onOpenChange, onSuccess, item, module }: UnassignOperatorDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serviceability, setServiceability] = useState<'Serviceable' | 'Unserviceable' | 'Under Repair'>('Serviceable');
  const [notes, setNotes] = useState("");

  const { data: operator } = useQuery({
    queryKey: ['operator-for-unassign', item?.operator_assigned],
    queryFn: async () => {
      if (!item?.operator_assigned) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit:units(name)')
        .eq('id', item.operator_assigned)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!item?.operator_assigned && open,
  });

  const reset = () => {
    setServiceability('Serviceable');
    setNotes("");
  };

  const handleUnassign = async () => {
    if (!item) {
      toast.error("No item selected");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from(module)
        .update({ operator_assigned: null, serviceability })
        .eq('id', item.id);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('transactions_detailed')
        .insert([{
          item_table: module,
          item_id: item.id,
          item_name: getItemDisplayName(item),
          transaction_type: 'return',
          from_user_id: item.operator_assigned,
          issued_by_id: profile?.id,
          unit_id: profile?.unit_id,
          serviceability,
          notes: notes || null,
        }]);

      if (transactionError) throw transactionError;

      toast.success("Operator unassigned");
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to unassign operator");
    } finally {
      setLoading(false);
    }
  };

  if (!item || !item.operator_assigned) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Operator Assigned</DialogTitle>
            <DialogDescription>This item has no operator currently assigned.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unassign Operator</DialogTitle>
          <DialogDescription>Confirm the item's condition and complete the unassignment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                Item:
              </Label>
              <div className="font-medium">{getItemDisplayName(item)}</div>
              <Badge variant="outline" className="mt-1">{getItemDisplayId(item)}</Badge>
            </div>
            <div className="border-t pt-3">
              <Label className="text-sm font-medium mb-2">Current Operator:</Label>
              {operator ? (
                <div className="font-medium">{operator.rank} {operator.name}</div>
              ) : (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="serviceability" className="text-sm font-medium">Serviceability *</Label>
            <Select value={serviceability} onValueChange={(v: any) => setServiceability(v)}>
              <SelectTrigger id="serviceability" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Serviceable">Serviceable</SelectItem>
                <SelectItem value="Unserviceable">Unserviceable</SelectItem>
                <SelectItem value="Under Repair">Under Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Odometer/hour-meter reading, damage, faults, etc."
              rows={2}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnassign} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Unassign Operator
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
