import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

interface MonthlyExchangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MonthlyExchangeDialog({ open, onOpenChange, onSuccess }: MonthlyExchangeDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [exchangeMonth, setExchangeMonth] = useState(new Date().toISOString().slice(0, 7) + '-01'); // First day of current month
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]); // IDs of issues to exchange
  const [exchangeReason, setExchangeReason] = useState<"unserviceable" | "shrinkage" | "outgrown" | "damage" | "missing" | "other">("unserviceable");
  const [exchangeDate, setExchangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  // Fetch units if user can see all units
  const { data: units = [] } = useQuery({
    queryKey: ['units-for-exchange'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: canSeeAllUnits,
  });

  // Set default unit
  useEffect(() => {
    if (!canSeeAllUnits && userUnitId) {
      setSelectedUnitId(userUnitId);
    } else if (canSeeAllUnits && units.length > 0 && !selectedUnitId) {
      setSelectedUnitId(units[0].id);
    }
  }, [canSeeAllUnits, userUnitId, units, selectedUnitId]);

  // Fetch available items for exchange (from clothing_equipment_issues that can be exchanged)
  const { data: availableIssues = [] } = useQuery({
    queryKey: ['exchangeable-items', selectedUnitId, itemName, canSeeAllUnits, userUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];

      let query = supabase
        .from('clothing_equipment_issues')
        .select(`
          id,
          issue_number,
          item_name,
          quantity_issued,
          issue_date,
          soldier:profiles!clothing_equipment_issues_soldier_id_fkey(id, name, rank, unit_id),
          exchange_requested,
          exchange_reason
        `)
        .is('return_date', null) // Only active issues
        .order('issue_date', { ascending: false });

      if (itemName) {
        query = query.eq('item_name', itemName);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by unit - respect selectedUnitId when set, or user's unit when can't see all
      const targetUnitId = selectedUnitId || (!canSeeAllUnits ? userUnitId : null);
      
      if (targetUnitId) {
        // Filter to only show items from soldiers in the target unit
        // Also apply unit filter at query level if possible
        const filtered = (data || []).filter((issue: any) => {
          const soldierUnitId = issue.soldier?.unit_id;
          return soldierUnitId === targetUnitId;
        });
        return filtered;
      }

      // If can see all units and no specific unit selected, return all
      // But still filter by soldier's unit if available
      if (canSeeAllUnits && !selectedUnitId) {
        return data || [];
      }

      // Default: filter by user's unit
      return (data || []).filter((issue: any) => {
        const soldierUnitId = issue.soldier?.unit_id;
        return soldierUnitId === userUnitId;
      });
    },
    enabled: !!selectedUnitId || (!canSeeAllUnits && !!userUnitId),
  });

  const handleSubmit = async () => {
    if (!selectedUnitId || !itemName || selectedIssues.length === 0) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      // Get the issue IDs being exchanged
      const itemsHandedIn = selectedIssues;
      
      // For now, we'll create exchange record - items_issued will be populated when new items are issued
      const { error } = await supabase
        .from('clothing_exchanges')
        .insert([{
          exchange_month: exchangeMonth,
          unit_id: selectedUnitId,
          item_name: itemName,
          quantity_exchanged: selectedIssues.length,
          exchange_reason: exchangeReason,
          items_handed_in: itemsHandedIn,
          items_issued: [], // Will be populated when new items are issued
          exchange_date: exchangeDate,
          processed_by_id: profile?.id,
          qm_reviewed: role === 'S4' || role === 'CO', // Auto-review if user is QM
          qm_approved: false, // Requires explicit approval
          qm_reviewed_by_id: (role === 'S4' || role === 'CO') ? profile?.id : null,
          notes: notes || null,
        }]);

      if (error) throw error;

      toast.success("Monthly exchange recorded. Awaiting QM review.");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error recording exchange:", error);
      toast.error(error.message || "Failed to record monthly exchange");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setExchangeMonth(new Date().toISOString().slice(0, 7) + '-01');
      setSelectedUnitId(null);
      setItemName("");
      setSelectedIssues([]);
      setExchangeReason("unserviceable");
      setExchangeDate(new Date().toISOString().split('T')[0]);
      setNotes("");
    }
  }, [open]);

  const progress = (step / 6) * 100;
  const isQM = role === 'S4' || role === 'CO';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monthly Clothing Exchange</DialogTitle>
          <DialogDescription>
            Record monthly clothing and equipment exchange (TTR Form 21)
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 6</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Exchange Month & Unit */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exchange-month">Exchange Month *</Label>
                <Input
                  id="exchange-month"
                  type="month"
                  value={exchangeMonth.slice(0, 7)}
                  onChange={(e) => setExchangeMonth(e.target.value + '-01')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="exchange-date">Exchange Date *</Label>
                <Input
                  id="exchange-date"
                  type="date"
                  value={exchangeDate}
                  onChange={(e) => setExchangeDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {canSeeAllUnits && (
              <div>
                <Label htmlFor="unit-select">Unit *</Label>
                <Select value={selectedUnitId || ""} onValueChange={setSelectedUnitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedUnitId || !exchangeMonth}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Item Type */}
        {step === 2 && selectedUnitId && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                placeholder="Enter item name..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
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
                disabled={!itemName}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Items to Exchange */}
        {step === 3 && selectedUnitId && itemName && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Select Items for Exchange</AlertTitle>
              <AlertDescription>
                Select the issues that will be handed in for exchange.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 max-h-96 overflow-y-auto border p-4 rounded-lg">
              {availableIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active issues found for {itemName}
                </p>
              ) : (
                availableIssues.map((issue: any) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Issue #{issue.issue_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {issue.soldier?.rank} {issue.soldier?.name} - Qty: {issue.quantity_issued}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Issued: {format(new Date(issue.issue_date), 'dd MMM yyyy')}
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedIssues.includes(issue.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIssues([...selectedIssues, issue.id]);
                        } else {
                          setSelectedIssues(selectedIssues.filter(id => id !== issue.id));
                        }
                      }}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                disabled={selectedIssues.length === 0}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Exchange Reason */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="exchange-reason">Exchange Reason *</Label>
              <Select value={exchangeReason} onValueChange={(value: any) => setExchangeReason(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unserviceable">Unserviceable</SelectItem>
                  <SelectItem value="shrinkage">Shrinkage</SelectItem>
                  <SelectItem value="outgrown">Outgrown</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about the exchange..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(5)}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: QM Review (if QM) or Summary */}
        {step === 5 && isQM && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>QM Review</AlertTitle>
              <AlertDescription>
                Review the exchange details and approve or reject.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 border p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Month:</span>
                  <div className="font-medium">{format(new Date(exchangeMonth), 'MMMM yyyy')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Item:</span>
                  <div className="font-medium">{itemName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <div className="font-medium">{selectedIssues.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Reason:</span>
                  <div className="font-medium capitalize">{exchangeReason}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(4)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(6)}
                className="flex-1"
              >
                Review →
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Final Review & Submit */}
        {step === 6 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Review Exchange</AlertTitle>
              <AlertDescription>
                Review all details before submitting the exchange record.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 border p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Exchange Month:</Label>
                  <div className="font-medium">{format(new Date(exchangeMonth), 'MMMM yyyy')}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Exchange Date:</Label>
                  <div className="font-medium">{format(new Date(exchangeDate), 'dd MMM yyyy')}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Item:</Label>
                  <div className="font-medium">{itemName}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantity:</Label>
                  <div className="font-medium">{selectedIssues.length} items</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reason:</Label>
                  <div className="font-medium capitalize">{exchangeReason}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(isQM ? 5 : 4)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Submitting..." : "✓ Submit Exchange"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

