import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getItemDisplayId, getItemDisplayName } from "@/lib/itemDisplay";

interface AssignOperatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any; // plant_machinery row
  module: string; // 'plant_machinery' (kept as a prop for consistency with the issue/return dialogs, not hardcoded)
}

export function AssignOperatorDialog({ open, onOpenChange, onSuccess, item, module }: AssignOperatorDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-operator-assign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit:units(name)')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const filteredSoldiers = soldiers.filter((s: any) => {
    if (!operatorSearch) return false;
    const q = operatorSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.rank?.toLowerCase().includes(q) ||
      s.service_number?.toLowerCase().includes(q)
    );
  });

  const reset = () => {
    setStep(1);
    setOperatorSearch("");
    setSelectedOperator(null);
    setNotes("");
  };

  const handleSelectOperator = (soldier: any) => {
    setSelectedOperator(soldier);
    setOperatorSearch("");
    setStep(2);
  };

  const handleAssign = async () => {
    if (!item || !selectedOperator) {
      toast.error("Select an operator first");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from(module)
        .update({ operator_assigned: selectedOperator.id })
        .eq('id', item.id);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('transactions_detailed')
        .insert([{
          item_table: module,
          item_id: item.id,
          item_name: getItemDisplayName(item),
          transaction_type: 'issue',
          to_user_id: selectedOperator.id,
          issued_by_id: profile?.id,
          unit_id: profile?.unit_id,
          notes: notes || null,
        }]);

      if (transactionError) throw transactionError;

      toast.success(`Operator assigned: ${selectedOperator.rank} ${selectedOperator.name}`);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign operator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Operator</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Search for the soldier who will operate this item" : "Confirm the assignment"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="operator-search" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Search for Operator
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="operator-search"
                  placeholder="Type name, rank, or service number..."
                  className="pl-9"
                  value={operatorSearch}
                  onChange={(e) => setOperatorSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {operatorSearch && filteredSoldiers.length > 0 && (
                <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                  {filteredSoldiers.slice(0, 5).map((soldier: any) => (
                    <button
                      key={soldier.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0"
                      onClick={() => handleSelectOperator(soldier)}
                    >
                      <div className="font-medium">{soldier.rank} {soldier.name}</div>
                      {soldier.unit?.name && (
                        <div className="text-sm text-muted-foreground">{soldier.unit.name}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
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
                <Label className="text-sm font-medium mb-2">Assigning To:</Label>
                <div className="font-medium">{selectedOperator.rank} {selectedOperator.name}</div>
                {selectedOperator.unit?.name && (
                  <div className="text-sm text-muted-foreground">{selectedOperator.unit.name}</div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Odometer/hour-meter reading, condition, task, etc."
                rows={2}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={handleAssign} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Assign Operator
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
