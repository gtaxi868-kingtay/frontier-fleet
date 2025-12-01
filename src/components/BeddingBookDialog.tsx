import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { validateRequired, validateDateNotFuture } from "@/lib/validation";

interface BeddingBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BeddingBookDialog({ open, onOpenChange, onSuccess }: BeddingBookDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomId, setRoomId] = useState("");
  const [sheetsCount, setSheetsCount] = useState(3);
  const [pillowcasesCount, setPillowcasesCount] = useState(2);
  const [lightweightBlankets, setLightweightBlankets] = useState(1);
  const [heavyweightBlankets, setHeavyweightBlankets] = useState(1);
  const [pillows, setPillows] = useState(1);
  const [mattresses, setMattresses] = useState(1);
  const [sheetsLaundered, setSheetsLaundered] = useState(false);
  const [blanketsAired, setBlanketsAired] = useState(false);
  const [deficiencies, setDeficiencies] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch soldiers
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-bedding-book'],
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

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!selectedSoldier) newErrors.soldier = 'Soldier is required';
    const dateValidation = validateDateNotFuture(checkDate);
    if (!dateValidation.valid) newErrors.checkDate = dateValidation.error || '';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bedding_book')
        .insert([{
          check_date: checkDate,
          soldier_id: selectedSoldier?.id || null,
          unit_id: selectedSoldier?.unit_id || userUnitId,
          room_id: roomId || null,
          sheets_count: sheetsCount,
          pillowcases_count: pillowcasesCount,
          lightweight_blankets: lightweightBlankets,
          heavyweight_blankets: heavyweightBlankets,
          pillows: pillows,
          mattresses: mattresses,
          sheets_laundered: sheetsLaundered,
          blankets_aired: blanketsAired,
          deficiencies: deficiencies.length > 0 ? deficiencies : null,
          check_completed_by: profile?.name || 'Unknown',
          notes: notes || null,
        }]);

      if (error) throw error;

      toast.success('Bedding book entry created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating bedding entry:', error);
      toast.error(error.message || "Failed to create bedding entry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSoldierSearch("");
      setSelectedSoldier(null);
      setCheckDate(new Date().toISOString().split('T')[0]);
      setRoomId("");
      setSheetsCount(3);
      setPillowcasesCount(2);
      setLightweightBlankets(1);
      setHeavyweightBlankets(1);
      setPillows(1);
      setMattresses(1);
      setSheetsLaundered(false);
      setBlanketsAired(false);
      setDeficiencies([]);
      setNotes("");
      setErrors({});
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bedding Book Entry</DialogTitle>
          <DialogDescription>
            Track weekly bedding checks
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

          <div>
            <Label htmlFor="check-date">Check Date *</Label>
            <Input
              id="check-date"
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
            />
            {errors.checkDate && (
              <p className="text-sm text-destructive mt-1">{errors.checkDate}</p>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sheets-count">Sheets (Scale: 3)</Label>
              <Input
                id="sheets-count"
                type="number"
                min="0"
                value={sheetsCount}
                onChange={(e) => setSheetsCount(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="pillowcases-count">Pillowcases (Scale: 2)</Label>
              <Input
                id="pillowcases-count"
                type="number"
                min="0"
                value={pillowcasesCount}
                onChange={(e) => setPillowcasesCount(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="pillows">Pillows (Scale: 1)</Label>
              <Input
                id="pillows"
                type="number"
                min="0"
                value={pillows}
                onChange={(e) => setPillows(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="lightweight-blankets">Lightweight Blankets (Scale: 1)</Label>
              <Input
                id="lightweight-blankets"
                type="number"
                min="0"
                value={lightweightBlankets}
                onChange={(e) => setLightweightBlankets(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="heavyweight-blankets">Heavyweight Blankets (Scale: 1)</Label>
              <Input
                id="heavyweight-blankets"
                type="number"
                min="0"
                value={heavyweightBlankets}
                onChange={(e) => setHeavyweightBlankets(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="mattresses">Mattresses (Scale: 1)</Label>
              <Input
                id="mattresses"
                type="number"
                min="0"
                value={mattresses}
                onChange={(e) => setMattresses(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sheets-laundered"
                checked={sheetsLaundered}
                onChange={(e) => setSheetsLaundered(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="sheets-laundered">Sheets Laundered (Weekly)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="blankets-aired"
                checked={blanketsAired}
                onChange={(e) => setBlanketsAired(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="blankets-aired">Blankets Aired (Weekly)</Label>
            </div>
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

