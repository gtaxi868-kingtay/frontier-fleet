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
import { Search, User } from "lucide-react";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { validateRequired, validateDateNotFuture } from "@/lib/validation";

interface BootBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BootBookDialog({ open, onOpenChange, onSuccess }: BootBookDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [entryNumber, setEntryNumber] = useState("");
  const [bootType, setBootType] = useState<"ankle" | "canvas" | "other">("ankle");
  const [handedInDate, setHandedInDate] = useState(new Date().toISOString().split('T')[0]);
  const [handedInBy, setHandedInBy] = useState("");
  const [handedInCondition, setHandedInCondition] = useState("");
  const [repairRequired, setRepairRequired] = useState<string[]>([]);
  const [repairStatus, setRepairStatus] = useState<"pending" | "in_progress" | "completed" | "condemned" | "beyond_repair">("pending");
  const [exchangeRequested, setExchangeRequested] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch soldiers
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-boot-book'],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit:units(name)')
        .order('name');

      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filteredSoldiers = soldiers.filter((s: any) => {
    if (!soldierSearch) return false;
    const searchLower = soldierSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(searchLower) ||
      s.rank?.toLowerCase().includes(searchLower) ||
      s.service_number?.toLowerCase().includes(searchLower)
    );
  });

  // Generate entry number if not provided
  useEffect(() => {
    if (open && !entryNumber) {
      const timestamp = Date.now().toString().slice(-6);
      setEntryNumber(`BB-${timestamp}`);
    }
  }, [open, entryNumber]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!selectedSoldier) {
      newErrors.soldier = 'Soldier is required';
    }
    if (!entryNumber) {
      newErrors.entryNumber = 'Entry number is required';
    }
    const dateValidation = validateDateNotFuture(handedInDate);
    if (!dateValidation.valid) newErrors.handedInDate = dateValidation.error || '';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('boot_book')
        .insert([{
          entry_number: entryNumber,
          soldier_id: selectedSoldier.id,
          unit_id: selectedSoldier.unit_id || userUnitId,
          boot_type: bootType,
          handed_in_date: handedInDate,
          handed_in_by: handedInBy || profile?.name || 'Unknown',
          handed_in_condition: handedInCondition || null,
          repair_required: repairRequired.length > 0 ? repairRequired : null,
          repair_status: repairStatus,
          exchange_requested: exchangeRequested,
          notes: notes || null,
        }]);

      if (error) throw error;

      toast.success('Boot book entry created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating boot entry:', error);
      toast.error(error.message || "Failed to create boot entry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSoldierSearch("");
      setSelectedSoldier(null);
      setEntryNumber("");
      setBootType("ankle");
      setHandedInDate(new Date().toISOString().split('T')[0]);
      setHandedInBy(profile?.name || "");
      setHandedInCondition("");
      setRepairRequired([]);
      setRepairStatus("pending");
      setExchangeRequested(false);
      setNotes("");
      setErrors({});
    }
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Boot Book Entry (TTR Form 84)</DialogTitle>
          <DialogDescription>
            Track boot repairs, condemnations, and exchanges
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="soldier-search" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Soldier *
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="soldier-search"
                placeholder="Type name, rank, or service number..."
                className="pl-9"
                value={soldierSearch}
                onChange={(e) => setSoldierSearch(e.target.value)}
              />
            </div>
            {selectedSoldier && (
              <div className="mt-2 p-2 bg-muted rounded">
                <div className="font-medium">{selectedSoldier.rank} {selectedSoldier.name}</div>
              </div>
            )}
            {soldierSearch && !selectedSoldier && filteredSoldiers.length > 0 && (
              <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                {filteredSoldiers.slice(0, 5).map((soldier: any) => (
                  <button
                    key={soldier.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0"
                    onClick={() => {
                      setSelectedSoldier(soldier);
                      setSoldierSearch("");
                    }}
                  >
                    <div className="font-medium">{soldier.rank} {soldier.name}</div>
                  </button>
                ))}
              </div>
            )}
            {errors.soldier && (
              <p className="text-sm text-destructive mt-1">{errors.soldier}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry-number">Entry Number *</Label>
              <Input
                id="entry-number"
                value={entryNumber}
                onChange={(e) => setEntryNumber(e.target.value)}
              />
              {errors.entryNumber && (
                <p className="text-sm text-destructive mt-1">{errors.entryNumber}</p>
              )}
            </div>
            <div>
              <Label htmlFor="boot-type">Boot Type *</Label>
              <Select value={bootType} onValueChange={(v: any) => setBootType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ankle">Ankle</SelectItem>
                  <SelectItem value="canvas">Canvas</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="handed-in-date">Handed In Date *</Label>
              <Input
                id="handed-in-date"
                type="date"
                value={handedInDate}
                onChange={(e) => setHandedInDate(e.target.value)}
              />
              {errors.handedInDate && (
                <p className="text-sm text-destructive mt-1">{errors.handedInDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="handed-in-by">Handed In By</Label>
              <Input
                id="handed-in-by"
                value={handedInBy}
                onChange={(e) => setHandedInBy(e.target.value)}
                placeholder="CQMS or storeman"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="handed-in-condition">Handed In Condition</Label>
            <Textarea
              id="handed-in-condition"
              value={handedInCondition}
              onChange={(e) => setHandedInCondition(e.target.value)}
              rows={2}
              placeholder="Describe condition of boots..."
            />
          </div>

          <div>
            <Label htmlFor="repair-status">Repair Status</Label>
            <Select value={repairStatus} onValueChange={(v: any) => setRepairStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="condemned">Condemned</SelectItem>
                <SelectItem value="beyond_repair">Beyond Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exchange-requested"
              checked={exchangeRequested}
              onCheckedChange={(checked) => setExchangeRequested(!!checked)}
            />
            <Label htmlFor="exchange-requested">Exchange Requested</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Entry"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

