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
import { Checkbox } from "@/components/ui/checkbox";

interface MTDriverPermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  permit?: any; // For editing existing permits
}

const VEHICLE_CLASSES = [
  'Car',
  'Land Rover SWB',
  'Land Rover LWB',
  'Motorcycle',
  'Truck 1 Ton Cargo',
  'Truck 5 Ton Cargo',
];

export function MTDriverPermitDialog({ open, onOpenChange, onSuccess, permit }: MTDriverPermitDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    permit_number: "",
    driver_id: "",
    vehicle_classes: [] as string[],
    issued_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Annual renewal on Jan 1
    status: permit?.status || 'active',
    notes: "",
  });

  // Fetch drivers (profiles) for dropdown
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers_for_permits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Generate permit number on mount if creating new
  useEffect(() => {
    if (open && !permit && !formData.permit_number) {
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({ ...prev, permit_number: `MDP-${timestamp}` }));
    }
  }, [open, permit]);

  // Load permit data if editing
  useEffect(() => {
    if (permit && open) {
      setFormData({
        permit_number: permit.permit_number || "",
        driver_id: permit.driver_id || "",
        vehicle_classes: permit.vehicle_classes || [],
        issued_date: permit.issued_date || new Date().toISOString().split('T')[0],
        expiry_date: permit.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: permit.status || 'active',
        notes: permit.notes || "",
      });
    }
  }, [permit, open]);

  const handleVehicleClassToggle = (vehicleClass: string) => {
    setFormData(prev => ({
      ...prev,
      vehicle_classes: prev.vehicle_classes.includes(vehicleClass)
        ? prev.vehicle_classes.filter(c => c !== vehicleClass)
        : [...prev.vehicle_classes, vehicleClass]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.driver_id || formData.vehicle_classes.length === 0) {
        toast.error("Please select a driver and at least one vehicle class");
        return;
      }

      const permitData = {
        permit_number: formData.permit_number,
        driver_id: formData.driver_id,
        vehicle_classes: formData.vehicle_classes,
        issued_by_id: profile?.id,
        issued_date: formData.issued_date,
        expiry_date: formData.expiry_date,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (permit) {
        // Update existing permit
        const { error } = await supabase
          .from('mt_driver_permits')
          .update(permitData)
          .eq('id', permit.id);

        if (error) throw error;
        toast.success("Driver permit updated successfully");
      } else {
        // Create new permit
        const { error } = await supabase
          .from('mt_driver_permits')
          .insert([permitData]);

        if (error) throw error;
        toast.success("Driver permit created successfully");
      }

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      if (!permit) {
        setFormData({
          permit_number: "",
          driver_id: "",
          vehicle_classes: [],
          issued_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          status: 'active',
          notes: "",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save driver permit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{permit ? 'Edit Driver Permit' : 'Issue Military Driving Permit'}</DialogTitle>
          <DialogDescription>
            {permit ? 'Update driver permit details' : 'Issue a new Military Driving Permit to a driver'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="permit_number">Permit Number *</Label>
              <Input
                id="permit_number"
                value={formData.permit_number}
                onChange={(e) => setFormData({ ...formData, permit_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="driver_id">Driver *</Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                required
                disabled={!!permit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver: any) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.rank} {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Vehicle Classes *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2 border rounded-md p-4">
              {VEHICLE_CLASSES.map((vehicleClass) => (
                <div key={vehicleClass} className="flex items-center space-x-2">
                  <Checkbox
                    id={vehicleClass}
                    checked={formData.vehicle_classes.includes(vehicleClass)}
                    onCheckedChange={() => handleVehicleClassToggle(vehicleClass)}
                  />
                  <label
                    htmlFor={vehicleClass}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {vehicleClass}
                  </label>
                </div>
              ))}
            </div>
            {formData.vehicle_classes.length === 0 && (
              <p className="text-sm text-destructive mt-1">Please select at least one vehicle class</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issued_date">Issued Date *</Label>
              <Input
                id="issued_date"
                type="date"
                value={formData.issued_date}
                onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Permits expire annually on Jan 1</p>
            </div>
          </div>

          {permit && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="provisional">Provisional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes or remarks..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (permit ? "Updating..." : "Creating...") : (permit ? "Update Permit" : "Issue Permit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

