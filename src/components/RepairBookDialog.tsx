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

interface RepairBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RepairBookDialog({ open, onOpenChange, onSuccess }: RepairBookDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [entryNumber, setEntryNumber] = useState("");
  const [roomId, setRoomId] = useState("");
  const [damageType, setDamageType] = useState<"accommodation" | "furniture" | "fixtures" | "other">("furniture");
  const [damageDescription, setDamageDescription] = useState("");
  const [damageDate, setDamageDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().split('T')[0]);
  const [causedBySearch, setCausedBySearch] = useState("");
  const [selectedCausedBy, setSelectedCausedBy] = useState<any>(null);
  const [causedByName, setCausedByName] = useState("");
  const [causeType, setCauseType] = useState<"fair_wear_tear" | "accident" | "misuse" | "willful" | "unknown">("unknown");
  const [status, setStatus] = useState<"reported" | "investigating" | "repairing" | "completed" | "closed">("reported");
  const [repairType, setRepairType] = useState<"unit_pioneer" | "government_works" | "civilian_contractor" | "other">("unit_pioneer");
  const [repairCost, setRepairCost] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch soldiers for caused_by
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-repair-book'],
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
    if (!causedBySearch) return false;
    const searchLower = causedBySearch.toLowerCase();
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
      setEntryNumber(`RB-${timestamp}`);
    }
  }, [open, entryNumber]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!entryNumber) newErrors.entryNumber = 'Entry number is required';
    if (!damageDescription) newErrors.damageDescription = 'Damage description is required';
    const damageDateValidation = validateDateNotFuture(damageDate);
    if (!damageDateValidation.valid) newErrors.damageDate = damageDateValidation.error || '';
    const reportedDateValidation = validateDateNotFuture(reportedDate);
    if (!reportedDateValidation.valid) newErrors.reportedDate = reportedDateValidation.error || '';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('repair_book')
        .insert([{
          entry_number: entryNumber,
          unit_id: userUnitId,
          room_id: roomId || null,
          damage_type: damageType,
          damage_description: damageDescription,
          damage_date: damageDate,
          reported_date: reportedDate,
          caused_by_id: selectedCausedBy?.id || null,
          caused_by_name: causedByName || null,
          cause_type: causeType,
          status: status,
          repair_type: repairType || null,
          repair_cost: repairCost ? parseFloat(repairCost) : null,
          notes: notes || null,
        }]);

      if (error) throw error;

      toast.success('Repair book entry created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating repair entry:', error);
      toast.error(error.message || "Failed to create repair entry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setEntryNumber("");
      setRoomId("");
      setDamageType("furniture");
      setDamageDescription("");
      setDamageDate(new Date().toISOString().split('T')[0]);
      setReportedDate(new Date().toISOString().split('T')[0]);
      setCausedBySearch("");
      setSelectedCausedBy(null);
      setCausedByName("");
      setCauseType("unknown");
      setStatus("reported");
      setRepairType("unit_pioneer");
      setRepairCost("");
      setNotes("");
      setErrors({});
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Repair Book Entry</DialogTitle>
          <DialogDescription>
            Track accommodation and furniture damage and repairs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              <Label htmlFor="room-id">Room ID</Label>
              <Input
                id="room-id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="damage-type">Damage Type *</Label>
            <Select value={damageType} onValueChange={(v: any) => setDamageType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="fixtures">Fixtures</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="damage-description">Damage Description *</Label>
            <Textarea
              id="damage-description"
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
              rows={3}
              placeholder="Describe the damage..."
            />
            {errors.damageDescription && (
              <p className="text-sm text-destructive mt-1">{errors.damageDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="damage-date">Damage Date *</Label>
              <Input
                id="damage-date"
                type="date"
                value={damageDate}
                onChange={(e) => setDamageDate(e.target.value)}
              />
              {errors.damageDate && (
                <p className="text-sm text-destructive mt-1">{errors.damageDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="reported-date">Reported Date *</Label>
              <Input
                id="reported-date"
                type="date"
                value={reportedDate}
                onChange={(e) => setReportedDate(e.target.value)}
              />
              {errors.reportedDate && (
                <p className="text-sm text-destructive mt-1">{errors.reportedDate}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="cause-type">Cause Type</Label>
            <Select value={causeType} onValueChange={(v: any) => setCauseType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fair_wear_tear">Fair Wear & Tear</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="misuse">Misuse</SelectItem>
                <SelectItem value="willful">Willful</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="caused-by-search" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Caused By (if known)
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="caused-by-search"
                placeholder="Search soldier or enter name..."
                className="pl-9"
                value={causedBySearch}
                onChange={(e) => setCausedBySearch(e.target.value)}
              />
            </div>
            {selectedCausedBy && (
              <div className="mt-2 p-2 bg-muted rounded">
                <div className="font-medium">{selectedCausedBy.rank} {selectedCausedBy.name}</div>
              </div>
            )}
            {causedBySearch && !selectedCausedBy && filteredSoldiers.length > 0 && (
              <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                {filteredSoldiers.slice(0, 5).map((soldier: any) => (
                  <button
                    key={soldier.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0"
                    onClick={() => {
                      setSelectedCausedBy(soldier);
                      setCausedBySearch("");
                    }}
                  >
                    <div className="font-medium">{soldier.rank} {soldier.name}</div>
                  </button>
                ))}
              </div>
            )}
            {!selectedCausedBy && (
              <Input
                className="mt-2"
                placeholder="Or enter name if not a system user"
                value={causedByName}
                onChange={(e) => setCausedByName(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="repairing">Repairing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="repair-type">Repair Type</Label>
            <Select value={repairType} onValueChange={(v: any) => setRepairType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit_pioneer">Unit Pioneer</SelectItem>
                <SelectItem value="government_works">Government Works</SelectItem>
                <SelectItem value="civilian_contractor">Civilian Contractor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="repair-cost">Repair Cost</Label>
            <Input
              id="repair-cost"
              type="number"
              step="0.01"
              min="0"
              value={repairCost}
              onChange={(e) => setRepairCost(e.target.value)}
              placeholder="0.00"
            />
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

