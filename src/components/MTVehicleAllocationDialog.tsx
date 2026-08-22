import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface MTVehicleAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  allocation?: any; // For editing
}

const ALLOCATION_TYPES = [
  { value: "CO", label: "Commanding Officer" },
  { value: "2IC", label: "Second-in-Command" },
  { value: "Rifle_Coy_Commander", label: "Rifle Company Commander" },
  { value: "Signals_Officer", label: "Signals Officer" },
  { value: "RP", label: "Regimental Police" },
  { value: "QM", label: "Quartermaster" },
  { value: "RSM", label: "Regimental Sergeant Major" },
  { value: "Dir_of_Mus", label: "Director of Music" },
];

export function MTVehicleAllocationDialog({ open, onOpenChange, onSuccess, allocation }: MTVehicleAllocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    allocated_to_id: "",
    allocation_type: "",
    allocated_from: new Date().toISOString().split("T")[0],
    allocated_until: "",
    notes: "",
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles_for_allocation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, vehicle_id, vehicle_type")
        .order("vehicle_id");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const { data: officers = [] } = useQuery({
    queryKey: ["officers_for_allocation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, rank")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        vehicle_id: allocation?.vehicle_id || "",
        allocated_to_id: allocation?.allocated_to_id || "",
        allocation_type: allocation?.allocation_type || "",
        allocated_from: allocation?.allocated_from || new Date().toISOString().split("T")[0],
        allocated_until: allocation?.allocated_until || "",
        notes: allocation?.notes || "",
      });
    }
  }, [allocation, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const allocationData = {
        vehicle_id: formData.vehicle_id,
        allocated_to_id: formData.allocated_to_id,
        allocation_type: formData.allocation_type,
        allocated_from: formData.allocated_from,
        allocated_until: formData.allocated_until || null,
        notes: formData.notes || null,
      };

      if (allocation) {
        const { error } = await supabase
          .from("mt_vehicle_allocations")
          .update(allocationData)
          .eq("id", allocation.id);
        if (error) throw error;
        toast.success("Vehicle allocation updated");
      } else {
        const { error } = await supabase.from("mt_vehicle_allocations").insert([allocationData]);
        if (error) throw error;
        toast.success("Vehicle allocated successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      if (error?.code === "23505") {
        toast.error("This vehicle is already allocated to this officer.");
      } else {
        toast.error(error.message || "Failed to save allocation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!allocation) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("mt_vehicle_allocations").delete().eq("id", allocation.id);
      if (error) throw error;
      toast.success("Vehicle allocation removed");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove allocation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{allocation ? "Edit Vehicle Allocation" : "Allocate Vehicle"}</DialogTitle>
          <DialogDescription>
            Assign a pool vehicle to an officer entitled to permanent or temporary allocation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_id">Vehicle *</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_id} - {v.vehicle_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="allocated_to_id">Allocated To *</Label>
              <Select
                value={formData.allocated_to_id}
                onValueChange={(value) => setFormData({ ...formData, allocated_to_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.rank} {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="allocation_type">Allocation Type *</Label>
            <Select
              value={formData.allocation_type}
              onValueChange={(value) => setFormData({ ...formData, allocation_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entitlement" />
              </SelectTrigger>
              <SelectContent>
                {ALLOCATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="allocated_from">Allocated From *</Label>
              <Input
                id="allocated_from"
                type="date"
                value={formData.allocated_from}
                onChange={(e) => setFormData({ ...formData, allocated_from: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="allocated_until">Allocated Until</Label>
              <Input
                id="allocated_until"
                type="date"
                value={formData.allocated_until}
                onChange={(e) => setFormData({ ...formData, allocated_until: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank for permanent allocation</p>
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

          <div className="flex justify-between gap-2">
            <div>
              {allocation && (
                <Button type="button" variant="destructive" onClick={handleRemove} disabled={loading}>
                  Remove Allocation
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : allocation ? "Update Allocation" : "Allocate Vehicle"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
