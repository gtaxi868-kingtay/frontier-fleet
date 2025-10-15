import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddEngineerEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEngineerEquipmentDialog({ open, onOpenChange, onSuccess }: AddEngineerEquipmentDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    equip_id: "",
    equipment_name: "",
    type: "",
    qty_on_hand: "",
    serviceable: true,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("engineer_equipment").insert({
        ...formData,
        qty_on_hand: formData.qty_on_hand ? parseInt(formData.qty_on_hand) : 0,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Equipment added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        equip_id: "",
        equipment_name: "",
        type: "",
        qty_on_hand: "",
        serviceable: true,
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Engineer Equipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equip_id">Equipment ID *</Label>
              <Input
                id="equip_id"
                value={formData.equip_id}
                onChange={(e) => setFormData({ ...formData, equip_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="equipment_name">Equipment Name *</Label>
              <Input
                id="equipment_name"
                value={formData.equipment_name}
                onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bridging Equipment">Bridging Equipment</SelectItem>
                  <SelectItem value="Construction Equipment">Construction Equipment</SelectItem>
                  <SelectItem value="Demolition Equipment">Demolition Equipment</SelectItem>
                  <SelectItem value="Surveying Equipment">Surveying Equipment</SelectItem>
                  <SelectItem value="Water Supply Equipment">Water Supply Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="qty_on_hand">Quantity on Hand</Label>
              <Input
                id="qty_on_hand"
                type="number"
                value={formData.qty_on_hand}
                onChange={(e) => setFormData({ ...formData, qty_on_hand: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Equipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
