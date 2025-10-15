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

interface AddPPEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPPEDialog({ open, onOpenChange, onSuccess }: AddPPEDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ppe_id: "",
    item: "",
    category: "",
    qty_on_hand: "",
    serviceable: true,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("ppe").insert({
        ...formData,
        qty_on_hand: formData.qty_on_hand ? parseInt(formData.qty_on_hand) : 0,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("PPE item added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        ppe_id: "",
        item: "",
        category: "",
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
          <DialogTitle>Add PPE Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ppe_id">PPE ID *</Label>
              <Input
                id="ppe_id"
                value={formData.ppe_id}
                onChange={(e) => setFormData({ ...formData, ppe_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="item">Item *</Label>
              <Input
                id="item"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head Protection">Head Protection</SelectItem>
                  <SelectItem value="Eye Protection">Eye Protection</SelectItem>
                  <SelectItem value="Hearing Protection">Hearing Protection</SelectItem>
                  <SelectItem value="Body Protection">Body Protection</SelectItem>
                  <SelectItem value="Hand Protection">Hand Protection</SelectItem>
                  <SelectItem value="Foot Protection">Foot Protection</SelectItem>
                  <SelectItem value="Respiratory Protection">Respiratory Protection</SelectItem>
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
              {loading ? "Adding..." : "Add PPE Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
