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

interface AddExplosiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddExplosiveDialog({ open, onOpenChange, onSuccess }: AddExplosiveDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    explosive_id: "",
    type: "",
    lot_number: "",
    quantity_received: "",
    storage_location: "",
    authority: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("explosives").insert({
        ...formData,
        quantity_received: formData.quantity_received ? parseInt(formData.quantity_received) : 0,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Explosive added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        explosive_id: "",
        type: "",
        lot_number: "",
        quantity_received: "",
        storage_location: "",
        authority: "",
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
          <DialogTitle>Add Explosive</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="explosive_id">Explosive ID *</Label>
              <Input
                id="explosive_id"
                value={formData.explosive_id}
                onChange={(e) => setFormData({ ...formData, explosive_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TNT">TNT</SelectItem>
                  <SelectItem value="C4">C4</SelectItem>
                  <SelectItem value="Dynamite">Dynamite</SelectItem>
                  <SelectItem value="Detonators">Detonators</SelectItem>
                  <SelectItem value="Safety Fuse">Safety Fuse</SelectItem>
                  <SelectItem value="Det Cord">Det Cord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lot_number">Lot Number *</Label>
              <Input
                id="lot_number"
                value={formData.lot_number}
                onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity_received">Quantity Received</Label>
              <Input
                id="quantity_received"
                type="number"
                value={formData.quantity_received}
                onChange={(e) => setFormData({ ...formData, quantity_received: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storage_location">Storage Location *</Label>
              <Input
                id="storage_location"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="authority">Authority *</Label>
              <Input
                id="authority"
                value={formData.authority}
                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                required
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
              {loading ? "Adding..." : "Add Explosive"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
