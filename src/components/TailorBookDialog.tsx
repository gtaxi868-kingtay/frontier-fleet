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

interface TailorBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TailorBookDialog({ open, onOpenChange, onSuccess }: TailorBookDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [entryNumber, setEntryNumber] = useState("");
  const [itemName, setItemName] = useState("");
  const [regimentalNumberVerified, setRegimentalNumberVerified] = useState(false);
  const [workType, setWorkType] = useState<"repair" | "alteration" | "both">("repair");
  const [workDescription, setWorkDescription] = useState("");
  const [submittedDate, setSubmittedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittedBy, setSubmittedBy] = useState("");
  const [tailorAssigned, setTailorAssigned] = useState("");
  const [workStatus, setWorkStatus] = useState<"pending" | "with_tailor" | "completed" | "returned">("pending");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch soldiers
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-tailor-book'],
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
      setEntryNumber(`TB-${timestamp}`);
    }
  }, [open, entryNumber]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!selectedSoldier) newErrors.soldier = 'Soldier is required';
    if (!entryNumber) newErrors.entryNumber = 'Entry number is required';
    if (!itemName) newErrors.itemName = 'Item name is required';
    if (!workDescription) newErrors.workDescription = 'Work description is required';
    const dateValidation = validateDateNotFuture(submittedDate);
    if (!dateValidation.valid) newErrors.submittedDate = dateValidation.error || '';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tailor_book')
        .insert([{
          soldier_id: selectedSoldier.id,
          squadron_id: selectedSoldier.unit_id || userUnitId,
          item_type: itemName,
          description: workDescription,
          entry_date: submittedDate,
          cost: null,
          paid: false,
          remarks: notes || null,
          inspector_id: profile?.id,
        }]);

      if (error) throw error;

      toast.success('Tailor book entry created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating tailor entry:', error);
      toast.error(error.message || "Failed to create tailor entry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSoldierSearch("");
      setSelectedSoldier(null);
      setEntryNumber("");
      setItemName("");
      setRegimentalNumberVerified(false);
      setWorkType("repair");
      setWorkDescription("");
      setSubmittedDate(new Date().toISOString().split('T')[0]);
      setSubmittedBy(profile?.name || "");
      setTailorAssigned("");
      setWorkStatus("pending");
      setNotes("");
      setErrors({});
    }
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tailor Book Entry</DialogTitle>
          <DialogDescription>
            Track clothing repairs and alterations with signatures
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
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Shirt, Trousers"
              />
              {errors.itemName && (
                <p className="text-sm text-destructive mt-1">{errors.itemName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="regimental-verified"
              checked={regimentalNumberVerified}
              onCheckedChange={(checked) => setRegimentalNumberVerified(!!checked)}
            />
            <Label htmlFor="regimental-verified">Regimental Number Verified</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work-type">Work Type *</Label>
              <Select value={workType} onValueChange={(v: any) => setWorkType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="alteration">Alteration</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="submitted-date">Submitted Date *</Label>
              <Input
                id="submitted-date"
                type="date"
                value={submittedDate}
                onChange={(e) => setSubmittedDate(e.target.value)}
              />
              {errors.submittedDate && (
                <p className="text-sm text-destructive mt-1">{errors.submittedDate}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="work-description">Work Description *</Label>
            <Textarea
              id="work-description"
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              rows={3}
              placeholder="Describe the repair or alteration work needed..."
            />
            {errors.workDescription && (
              <p className="text-sm text-destructive mt-1">{errors.workDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submitted-by">Submitted By</Label>
              <Input
                id="submitted-by"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="CQMS or storeman"
              />
            </div>
            <div>
              <Label htmlFor="tailor-assigned">Tailor Assigned</Label>
              <Input
                id="tailor-assigned"
                value={tailorAssigned}
                onChange={(e) => setTailorAssigned(e.target.value)}
                placeholder="Bn tailor or contract tailor"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="work-status">Work Status</Label>
            <Select value={workStatus} onValueChange={(v: any) => setWorkStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="with_tailor">With Tailor</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
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

