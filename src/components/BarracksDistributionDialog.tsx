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
import { Search, Building, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

interface BarracksDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  barracksStoreItem?: any; // Pre-selected barracks store item
}

export function BarracksDistributionDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  barracksStoreItem 
}: BarracksDistributionDialogProps) {
  const { profile, role } = useAuth();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedStoreItem, setSelectedStoreItem] = useState<any>(barracksStoreItem || null);
  const [itemSearch, setItemSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [conditionOnIssue, setConditionOnIssue] = useState("serviceable");
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  const canManage = role === 'S4' || role === 'SQMS' || role === 'S4_ADMIN' || role === 'CO';

  // Fetch barracks stores items
  const { data: storeItems = [] } = useQuery({
    queryKey: ['barracks-stores-for-distribution', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('barracks_stores')
        .select('*, unit:units(name)')
        .gt('quantity_available', 0) // Only items with available quantity
        .order('item_name');

      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open && step === 1,
  });

  // Fetch rooms
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms-for-distribution', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('room_inventory')
        .select('*')
        .order('room_id');

      // Filter by unit if needed (assuming platoon_company field can be used)
      // Note: room_inventory might not have direct unit_id, adjust based on schema

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open && step === 2,
  });

  // Filter rooms based on search
  const filteredRooms = rooms.filter((room: any) => {
    if (!roomSearch) return false;
    const searchLower = roomSearch.toLowerCase();
    return (
      room.room_id?.toLowerCase().includes(searchLower) ||
      room.room_type?.toLowerCase().includes(searchLower) ||
      room.platoon_company?.toLowerCase().includes(searchLower)
    );
  });

  // Set selected store item if provided
  useEffect(() => {
    if (barracksStoreItem && open) {
      setSelectedStoreItem(barracksStoreItem);
      setStep(2); // Skip to room selection if item pre-selected
    }
  }, [barracksStoreItem, open]);

  const handleStoreItemSelect = (item: any) => {
    setSelectedStoreItem(item);
    setItemSearch("");
    setRoomSearch("");
    setSelectedRoom(null);
    setQuantity(1);
    setStep(2);
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setRoomSearch("");
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedStoreItem || !selectedRoom || quantity <= 0) {
      toast.error("Please complete all required fields");
      return;
    }

    if (quantity > (selectedStoreItem.quantity_available || 0)) {
      toast.error(`Insufficient quantity. Only ${selectedStoreItem.quantity_available} available.`);
      return;
    }

    setLoading(true);
    try {
      // Create distribution record
      const { data: distributionData, error: distError } = await supabase
        .from('barracks_stores_distribution')
        .insert([{
          barracks_store_id: selectedStoreItem.id,
          room_id: selectedRoom.id,
          room_identifier: selectedRoom.room_id,
          quantity: quantity,
          condition_on_issue: conditionOnIssue,
          condition_current: conditionOnIssue,
          issued_date: issuedDate,
          notes: notes || null,
        }])
        .select()
        .single();

      if (distError) throw distError;

      // Update barracks stores quantities
      const newAvailable = (selectedStoreItem.quantity_available || 0) - quantity;
      const newIssued = (selectedStoreItem.quantity_issued || 0) + quantity;

      const { error: updateError } = await supabase
        .from('barracks_stores')
        .update({
          quantity_available: newAvailable,
          quantity_issued: newIssued,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedStoreItem.id);

      if (updateError) throw updateError;

      toast.success(
        `Distributed ${quantity} ${selectedStoreItem.item_name}(s) to ${selectedRoom.room_id}`
      );

      // Reset form
      setStep(1);
      setSelectedStoreItem(null);
      setSelectedRoom(null);
      setRoomSearch("");
      setQuantity(1);
      setConditionOnIssue("serviceable");
      setIssuedDate(new Date().toISOString().split('T')[0]);
      setNotes("");

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error distributing item:', error);
      const errorMessage = error.message || "Failed to distribute item";
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        toast.error('You do not have permission to distribute items.');
      } else if (errorMessage.includes('constraint') || errorMessage.includes('violates')) {
        toast.error('Cannot distribute: Data constraint violation. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedStoreItem(barracksStoreItem || null);
      setSelectedRoom(null);
      setItemSearch("");
      setRoomSearch("");
      setQuantity(1);
      setConditionOnIssue("serviceable");
      setIssuedDate(new Date().toISOString().split('T')[0]);
      setNotes("");
    }
  }, [open, barracksStoreItem]);

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Distribute Barracks Stores to Room</DialogTitle>
          <DialogDescription>
            Assign barracks stores items to specific rooms
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

        {/* Step 1: Select Store Item */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-search" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Search for Barracks Store Item
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="item-search"
                  placeholder="Type item name or ID..."
                  className="pl-9"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {storeItems.length > 0 && (
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {storeItems
                  .filter((item: any) => {
                    if (!itemSearch) return true;
                    const searchLower = itemSearch.toLowerCase();
                    return (
                      item.item_name?.toLowerCase().includes(searchLower) ||
                      item.item_id?.toLowerCase().includes(searchLower) ||
                      item.item_type?.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((item: any) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0"
                      onClick={() => handleStoreItemSelect(item)}
                    >
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.item_id} • Available: {item.quantity_available || 0}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Room */}
        {step === 2 && selectedStoreItem && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="font-medium">Selected Item: {selectedStoreItem.item_name}</div>
              <div className="text-sm text-muted-foreground">
                Available: {selectedStoreItem.quantity_available || 0}
              </div>
            </div>

            <div>
              <Label htmlFor="room-search" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Search for Room
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="room-search"
                  placeholder="Type room ID or type..."
                  className="pl-9"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {filteredRooms.length > 0 && (
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {filteredRooms.slice(0, 10).map((room: any) => (
                  <button
                    key={room.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0"
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="font-medium">{room.room_id}</div>
                    <div className="text-sm text-muted-foreground">
                      {room.room_type} • {room.platoon_company || 'N/A'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {roomSearch && filteredRooms.length === 0 && (
              <p className="text-sm text-muted-foreground">No rooms found</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setSelectedStoreItem(null);
                }}
              >
                ← Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Enter Details */}
        {step === 3 && selectedStoreItem && selectedRoom && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="font-medium">Item: {selectedStoreItem.item_name}</div>
              <div className="font-medium">Room: {selectedRoom.room_id} ({selectedRoom.room_type})</div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedStoreItem.quantity_available || 0}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {selectedStoreItem.quantity_available || 0}
              </p>
            </div>

            <div>
              <Label htmlFor="condition">Condition on Issue *</Label>
              <Select value={conditionOnIssue} onValueChange={setConditionOnIssue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serviceable">Serviceable</SelectItem>
                  <SelectItem value="unserviceable">Unserviceable</SelectItem>
                  <SelectItem value="needs_repair">Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issued-date">Issued Date *</Label>
              <Input
                id="issued-date"
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this distribution..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(2);
                  setSelectedRoom(null);
                  setRoomSearch("");
                }}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || quantity <= 0 || quantity > (selectedStoreItem.quantity_available || 0)}
                className="flex-1"
              >
                {loading ? "Distributing..." : "✓ Distribute Item"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

