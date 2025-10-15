import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddFacilityDialog({ open, onOpenChange, onSuccess }: AddFacilityDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    facility_id: "",
    facility_name: "",
    element: "",
    quantity: "",
    working: "",
    not_working: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("facilities").insert({
        ...formData,
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        working: formData.working ? parseInt(formData.working) : 0,
        not_working: formData.not_working ? parseInt(formData.not_working) : 0,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Facility added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        facility_id: "",
        facility_name: "",
        element: "",
        quantity: "",
        working: "",
        not_working: "",
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
          <DialogTitle>Add Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facility_id">Facility ID *</Label>
              <Input
                id="facility_id"
                value={formData.facility_id}
                onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="facility_name">Facility Name *</Label>
              <Input
                id="facility_name"
                value={formData.facility_name}
                onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="element">Element</Label>
              <Input
                id="element"
                value={formData.element}
                onChange={(e) => setFormData({ ...formData, element: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Total Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="working">Working</Label>
              <Input
                id="working"
                type="number"
                value={formData.working}
                onChange={(e) => setFormData({ ...formData, working: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="not_working">Not Working</Label>
              <Input
                id="not_working"
                type="number"
                value={formData.not_working}
                onChange={(e) => setFormData({ ...formData, not_working: e.target.value })}
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
              {loading ? "Adding..." : "Add Facility"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
