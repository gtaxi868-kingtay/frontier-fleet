import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddWorksMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddWorksMaterialDialog({ open, onOpenChange, onSuccess }: AddWorksMaterialDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    voucher_id: "",
    material: "",
    project_task: "",
    quantity_received: "",
    authority: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("works_materials").insert({
        ...formData,
        quantity_received: formData.quantity_received ? parseInt(formData.quantity_received) : 0,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Works material added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        voucher_id: "",
        material: "",
        project_task: "",
        quantity_received: "",
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
          <DialogTitle>Add Works Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voucher_id">Voucher ID *</Label>
              <Input
                id="voucher_id"
                value={formData.voucher_id}
                onChange={(e) => setFormData({ ...formData, voucher_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="material">Material *</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_task">Project/Task *</Label>
              <Input
                id="project_task"
                value={formData.project_task}
                onChange={(e) => setFormData({ ...formData, project_task: e.target.value })}
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

          <div>
            <Label htmlFor="authority">Authority</Label>
            <Input
              id="authority"
              value={formData.authority}
              onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
            />
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
              {loading ? "Adding..." : "Add Material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
