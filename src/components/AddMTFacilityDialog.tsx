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

interface AddMTFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMTFacilityDialog({ open, onOpenChange, onSuccess }: AddMTFacilityDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    facility_id: "",
    facility_name: "",
    facility_type: "",
    capacity: "",
    status: "Operational",
    last_maintenance_date: "",
    next_maintenance_due: "",
    equipment_present: "",
    location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("mt_facilities").insert({
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Facility added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        facility_id: "",
        facility_name: "",
        facility_type: "",
        capacity: "",
        status: "Operational",
        last_maintenance_date: "",
        next_maintenance_due: "",
        equipment_present: "",
        location: "",
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
          <DialogTitle>Add MT Facility</DialogTitle>
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
              <Label htmlFor="facility_type">Facility Type *</Label>
              <Select value={formData.facility_type} onValueChange={(value) => setFormData({ ...formData, facility_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Garage">Garage</SelectItem>
                  <SelectItem value="Inspection Bay">Inspection Bay</SelectItem>
                  <SelectItem value="Wash Bay">Wash Bay</SelectItem>
                  <SelectItem value="Paint Shop">Paint Shop</SelectItem>
                  <SelectItem value="Parts Store">Parts Store</SelectItem>
                  <SelectItem value="Fuel Station">Fuel Station</SelectItem>
                  <SelectItem value="Vehicle Park">Vehicle Park</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., number of vehicles"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Non-Operational">Non-Operational</SelectItem>
                  <SelectItem value="Limited Use">Limited Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
              <Input
                id="last_maintenance_date"
                type="date"
                value={formData.last_maintenance_date}
                onChange={(e) => setFormData({ ...formData, last_maintenance_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="next_maintenance_due">Next Maintenance Due</Label>
              <Input
                id="next_maintenance_due"
                type="date"
                value={formData.next_maintenance_due}
                onChange={(e) => setFormData({ ...formData, next_maintenance_due: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="equipment_present">Equipment Present</Label>
            <Textarea
              id="equipment_present"
              value={formData.equipment_present}
              onChange={(e) => setFormData({ ...formData, equipment_present: e.target.value })}
              placeholder="List major equipment/tools available in this facility"
              rows={2}
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
              {loading ? "Adding..." : "Add Facility"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
