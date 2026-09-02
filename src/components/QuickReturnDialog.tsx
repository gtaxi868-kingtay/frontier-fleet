import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReturnReceipt } from "@/components/ReturnReceipt";
import { getItemDisplayId, getItemDisplayName } from "@/lib/itemDisplay";

interface QuickReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any; // Pre-selected item with issued_to info
  module: string;
}

export function QuickReturnDialog({ open, onOpenChange, onSuccess, item, module }: QuickReturnDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Check Condition, 2: Review, 3: Complete
  const [condition, setCondition] = useState<'Serviceable' | 'Unserviceable' | 'Damaged'>('Serviceable');
  const [notes, setNotes] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [returnedItemData, setReturnedItemData] = useState<any>(null);

  // Fetch soldier info if item is issued
  const { data: soldier } = useQuery({
    queryKey: ['soldier-for-return', item?.issued_to],
    queryFn: async () => {
      if (!item?.issued_to) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit:units(name)')
        .eq('id', item.issued_to)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!item?.issued_to,
  });

  const handleReturn = async () => {
    if (!item) {
      toast.error("No item selected");
      return;
    }

    setLoading(true);
    try {
      const returnDate = new Date().toISOString().split('T')[0];
      
      // Update item to mark as returned. Not every per-unit module has a
      // condition_return column (weapons doesn't) - only set it when the
      // fetched row actually carries that field.
      const updateData: any = {
        issued_to: null,
        return_date: returnDate,
        serviceable: condition === 'Serviceable',
      };
      if (item.condition_return !== undefined) {
        updateData.condition_return = condition;
      }

      // Handle quantity-based items
      if (item.qty_on_hand !== undefined && item.qty_on_hand !== null) {
        const returnedQty = item.qty_issued || 1; // Default to 1 if not specified
        updateData.qty_on_hand = (item.qty_on_hand || 0) + returnedQty;
        updateData.qty_issued = 0;
      }

      // Update item in database
      const { error: updateError } = await supabase
        .from(module)
        .update(updateData)
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions_detailed')
        .insert([{
          item_table: module,
          item_id: item.id,
          transaction_type: 'return',
          from_user_id: item.issued_to,
          to_user_id: null,
          quantity: item.qty_issued || 1,
          issued_by_id: profile?.id,
          unit_id: profile?.unit_id,
          condition_return: condition,
          notes: notes || null,
        }]);

      if (transactionError) throw transactionError;

      // Store return data for receipt
      if (soldier) {
        setReturnedItemData({
          issueNumber: getItemDisplayId(item),
          itemName: getItemDisplayName(item),
          quantity: item.qty_issued || 1,
          soldierName: soldier.name,
          soldierRank: soldier.rank || '',
          serviceNumber: soldier.service_number,
          returnedBy: profile?.name || 'Unknown',
          returnedByRank: profile?.rank || undefined,
          returnDate: returnDate,
          conditionOnReturn: condition,
          unitName: item.unit?.name,
        });
        setReceiptOpen(true);
      }

      toast.success("Item returned successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to return item");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  if (!item || !item.issued_to) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Return Item</DialogTitle>
            <DialogDescription>
              This item is not currently issued to anyone.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return Item</DialogTitle>
          <DialogDescription>
            Check item condition and complete return
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Check Condition */}
        {step === 1 && (
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
                <Label className="text-sm font-medium mb-2">Returned From:</Label>
                {soldier ? (
                  <div className="font-medium">{soldier.rank} {soldier.name}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="condition" className="text-base font-medium">
                What is the condition of this item? *
              </Label>
              <Select value={condition} onValueChange={(value: any) => setCondition(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Serviceable">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Serviceable - Good condition, ready to use</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Unserviceable">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Unserviceable - Needs repair but can be fixed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Damaged">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Damaged - Significant damage or missing parts</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(condition === 'Unserviceable' || condition === 'Damaged') && (
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the damage or issue..."
                  className="w-full mt-2 p-2 border rounded-md min-h-[80px]"
                />
              </div>
            )}

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Item:</span>
                <span className="font-medium">{getItemDisplayName(item)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Returned From:</span>
                <span className="font-medium">{soldier?.rank} {soldier?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Condition:</span>
                <Badge 
                  variant={
                    condition === 'Serviceable' ? 'default' : 
                    condition === 'Unserviceable' ? 'secondary' : 
                    'destructive'
                  }
                >
                  {condition}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ready to Return</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Click "Return Item" to complete the return process
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleReturn}
                disabled={loading}
                className="flex-1"
                variant={condition === 'Damaged' ? 'destructive' : 'default'}
              >
                {loading ? "Returning..." : "✓ Return Item"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Receipt Dialog */}
      {returnedItemData && (
        <ReturnReceipt
          open={receiptOpen}
          onOpenChange={(open) => {
            setReceiptOpen(open);
            if (!open) {
              // Reset receipt state but don't close main dialog automatically
              setReturnedItemData(null);
            }
          }}
          returnData={returnedItemData}
          onSkip={() => {
            // Just close receipt, keep dialog open for another return
            setReceiptOpen(false);
            setReturnedItemData(null);
            setStep(1);
            setCondition('Serviceable');
            setNotes("");
          }}
          onReturnAnother={() => {
            // Reset for another return
            setReceiptOpen(false);
            setReturnedItemData(null);
            setStep(1);
            setCondition('Serviceable');
            setNotes("");
          }}
        />
      )}
    </Dialog>
  );
}

