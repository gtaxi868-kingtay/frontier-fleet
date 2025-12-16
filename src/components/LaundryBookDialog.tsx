import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { validateQuantity, validateRequired, validateDateNotFuture } from "@/lib/validation";

interface LaundryBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LaundryBookDialog({ open, onOpenChange, onSuccess }: LaundryBookDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [bundleNumber, setBundleNumber] = useState("");
  const [articlesCount, setArticlesCount] = useState(1);
  const [kdGarmentsCount, setKdGarmentsCount] = useState(0);
  const [handedInDate, setHandedInDate] = useState(new Date().toISOString().split('T')[0]);
  const [handedInBy, setHandedInBy] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [weeklyTotal, setWeeklyTotal] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch soldiers
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-laundry'],
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const dateValidation = validateDateNotFuture(entryDate);
    if (!dateValidation.valid) newErrors.entryDate = dateValidation.error || '';

    const handedInDateValidation = validateDateNotFuture(handedInDate);
    if (!handedInDateValidation.valid) newErrors.handedInDate = handedInDateValidation.error || '';

    const articlesValidation = validateQuantity(articlesCount);
    if (!articlesValidation.valid) newErrors.articlesCount = articlesValidation.error || '';

    if (articlesCount > 25) {
      newErrors.articlesCount = 'Maximum 25 articles per week';
    }

    if (kdGarmentsCount > 3) {
      newErrors.kdGarmentsCount = 'Maximum 3 KD garments per half bundle';
    }

    const soldierValidation = validateRequired(selectedSoldier, 'Soldier');
    if (!soldierValidation.valid) newErrors.soldier = soldierValidation.error || '';

    const handedInByValidation = validateRequired(handedInBy, 'Handed in by');
    if (!handedInByValidation.valid) newErrors.handedInBy = handedInByValidation.error || '';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('laundry_book')
        .insert([{
          entry_date: entryDate,
          squadron_id: selectedSoldier.unit_id || userUnitId,
          soldier_id: selectedSoldier.id,
          item_type: 'laundry_bundle',
          quantity: articlesCount,
          sent_date: handedInDate,
          condition: 'Good',
          remarks: notes || null,
          inspector_id: profile?.id,
        }]);

      if (error) throw error;

      toast.success('Laundry book entry created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating laundry entry:', error);
      const errorMessage = error.message || "Failed to create laundry entry";
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        toast.error('You do not have permission to create laundry entries.');
      } else if (errorMessage.includes('constraint')) {
        toast.error('Validation error. Please check your input.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSoldierSearch("");
      setSelectedSoldier(null);
      setEntryDate(new Date().toISOString().split('T')[0]);
      setBundleNumber("");
      setArticlesCount(1);
      setKdGarmentsCount(0);
      setHandedInDate(new Date().toISOString().split('T')[0]);
      setHandedInBy(profile?.name || "");
      setServiceProvider("");
      setWeeklyTotal(false);
      setNotes("");
      setErrors({});
    }
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Laundry Book Entry</DialogTitle>
          <DialogDescription>
            Record weekly laundry (max 25 articles, 3 KD garments per half bundle)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {articlesCount > 25 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Maximum Exceeded</AlertTitle>
              <AlertDescription>
                Maximum 25 articles per week. Current: {articlesCount}
              </AlertDescription>
            </Alert>
          )}

          {kdGarmentsCount > 3 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Maximum Exceeded</AlertTitle>
              <AlertDescription>
                Maximum 3 KD garments per half bundle. Current: {kdGarmentsCount}
              </AlertDescription>
            </Alert>
          )}

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
                {selectedSoldier.unit?.name && (
                  <div className="text-sm text-muted-foreground">{selectedSoldier.unit.name}</div>
                )}
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
                    {soldier.unit?.name && (
                      <div className="text-sm text-muted-foreground">{soldier.unit.name}</div>
                    )}
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
              <Label htmlFor="entry-date">Entry Date *</Label>
              <Input
                id="entry-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
              {errors.entryDate && (
                <p className="text-sm text-destructive mt-1">{errors.entryDate}</p>
              )}
            </div>
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
          </div>

          <div>
            <Label htmlFor="bundle-number">Bundle Number</Label>
            <Input
              id="bundle-number"
              value={bundleNumber}
              onChange={(e) => setBundleNumber(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="articles-count">Articles Count * (Max 25)</Label>
              <Input
                id="articles-count"
                type="number"
                min="1"
                max="25"
                value={articlesCount}
                onChange={(e) => setArticlesCount(parseInt(e.target.value) || 1)}
              />
              {errors.articlesCount && (
                <p className="text-sm text-destructive mt-1">{errors.articlesCount}</p>
              )}
            </div>
            <div>
              <Label htmlFor="kd-garments">KD Garments (Max 3)</Label>
              <Input
                id="kd-garments"
                type="number"
                min="0"
                max="3"
                value={kdGarmentsCount}
                onChange={(e) => setKdGarmentsCount(parseInt(e.target.value) || 0)}
              />
              {errors.kdGarmentsCount && (
                <p className="text-sm text-destructive mt-1">{errors.kdGarmentsCount}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="handed-in-by">Handed In By *</Label>
            <Input
              id="handed-in-by"
              value={handedInBy}
              onChange={(e) => setHandedInBy(e.target.value)}
              placeholder="Storeman or CQMS"
            />
            {errors.handedInBy && (
              <p className="text-sm text-destructive mt-1">{errors.handedInBy}</p>
            )}
          </div>

          <div>
            <Label htmlFor="service-provider">Service Provider</Label>
            <Input
              id="service-provider"
              value={serviceProvider}
              onChange={(e) => setServiceProvider(e.target.value)}
              placeholder="Laundry contract provider"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="weekly-total"
              checked={weeklyTotal}
              onChange={(e) => setWeeklyTotal(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="weekly-total">Weekly Total (max 25 articles)</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
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

