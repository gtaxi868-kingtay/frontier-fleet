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
import { Calendar } from "lucide-react";

interface WorkshopInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  inspection?: any; // For editing
}

export function WorkshopInspectionDialog({ open, onOpenChange, onSuccess, inspection }: WorkshopInspectionDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inspection_date: new Date().toISOString().split('T')[0],
    equipment_type: 'vehicle',
    equipment_id: '',
    equipment_reference: '',
    equipment_name: '',
    unit_id: '',
    inspection_status: 'serviceable',
    defects_found: [] as string[],
    repair_required: '',
    estimated_repair_cost: '',
    repair_capacity: 'workshop_capacity',
    notes: '',
  });

  const [defectInput, setDefectInput] = useState('');

  // Fetch units for dropdown
  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch vehicles for equipment selection
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles_for_inspection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_id, vehicle_type')
        .order('vehicle_id');
      if (error) throw error;
      return data || [];
    },
    enabled: formData.equipment_type === 'vehicle',
  });

  useEffect(() => {
    if (inspection && open) {
      setFormData({
        inspection_date: inspection.inspection_date || new Date().toISOString().split('T')[0],
        equipment_type: inspection.equipment_type || 'vehicle',
        equipment_id: inspection.equipment_id || '',
        equipment_reference: inspection.equipment_reference || '',
        equipment_name: inspection.equipment_name || '',
        unit_id: inspection.unit_id || '',
        inspection_status: inspection.inspection_status || 'serviceable',
        defects_found: inspection.defects_found || [],
        repair_required: inspection.repair_required || '',
        estimated_repair_cost: inspection.estimated_repair_cost?.toString() || '',
        repair_capacity: inspection.repair_capacity || 'workshop_capacity',
        notes: inspection.notes || '',
      });
    }
  }, [inspection, open]);

  const addDefect = () => {
    if (defectInput.trim()) {
      setFormData(prev => ({
        ...prev,
        defects_found: [...prev.defects_found, defectInput.trim()]
      }));
      setDefectInput('');
    }
  };

  const removeDefect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      defects_found: prev.defects_found.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate inspection number if new
      let inspection_number = inspection?.inspection_number;
      if (!inspection_number) {
        const timestamp = Date.now().toString().slice(-6);
        inspection_number = `WIN-${timestamp}`;
      }

      // Calculate next inspection due date (bimonthly = 2 months from inspection date)
      const inspectionDate = new Date(formData.inspection_date);
      const nextInspectionDate = new Date(inspectionDate);
      nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 2);

      const inspectionData = {
        inspection_number,
        inspection_date: formData.inspection_date,
        inspected_by_id: profile?.id,
        equipment_type: formData.equipment_type,
        equipment_id: formData.equipment_id || null,
        equipment_reference: formData.equipment_reference || null,
        equipment_name: formData.equipment_name || null,
        unit_id: formData.unit_id || null,
        inspection_status: formData.inspection_status,
        defects_found: formData.defects_found,
        repair_required: formData.repair_required || null,
        estimated_repair_cost: formData.estimated_repair_cost ? parseFloat(formData.estimated_repair_cost) : null,
        repair_capacity: formData.repair_capacity,
        next_inspection_due: nextInspectionDate.toISOString().split('T')[0],
        notes: formData.notes || null,
        report_submitted_to_mto: false,
      };

      if (inspection) {
        const { error } = await supabase
          .from('workshop_inspections')
          .update(inspectionData)
          .eq('id', inspection.id);

        if (error) throw error;
        toast.success("Inspection updated successfully");
      } else {
        const { error } = await supabase
          .from('workshop_inspections')
          .insert([inspectionData]);

        if (error) throw error;
        toast.success("Inspection recorded successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save inspection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{inspection ? 'Edit Workshop Inspection' : 'Record Bimonthly Inspection'}</DialogTitle>
          <DialogDescription>
            Record equipment inspection (bimonthly). Next inspection will be scheduled 2 months from inspection date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inspection_date">Inspection Date *</Label>
              <Input
                id="inspection_date"
                type="date"
                value={formData.inspection_date}
                onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="equipment_type">Equipment Type *</Label>
              <Select
                value={formData.equipment_type}
                onValueChange={(value) => setFormData({ ...formData, equipment_type: value, equipment_id: '', equipment_reference: '' })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="plant_machinery">Plant & Machinery</SelectItem>
                  <SelectItem value="mechanics_tools">Mechanics Tools</SelectItem>
                  <SelectItem value="general">General Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.equipment_type === 'vehicle' && (
            <div>
              <Label htmlFor="equipment_id">Vehicle *</Label>
              <Select
                value={formData.equipment_id}
                onValueChange={(value) => {
                  const vehicle = vehicles.find((v: any) => v.id === value);
                  setFormData({ 
                    ...formData, 
                    equipment_id: value,
                    equipment_reference: vehicle?.vehicle_id || '',
                    equipment_name: `${vehicle?.vehicle_id} - ${vehicle?.vehicle_type}` || ''
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle: any) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_id} - {vehicle.vehicle_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.equipment_type !== 'vehicle' && (
            <>
              <div>
                <Label htmlFor="equipment_reference">Equipment Reference/ID</Label>
                <Input
                  id="equipment_reference"
                  value={formData.equipment_reference}
                  onChange={(e) => setFormData({ ...formData, equipment_reference: e.target.value })}
                  placeholder="Equipment ID or reference number"
                />
              </div>
              <div>
                <Label htmlFor="equipment_name">Equipment Name</Label>
                <Input
                  id="equipment_name"
                  value={formData.equipment_name}
                  onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="unit_id">Unit</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="inspection_status">Inspection Status *</Label>
            <Select
              value={formData.inspection_status}
              onValueChange={(value) => setFormData({ ...formData, inspection_status: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serviceable">Serviceable</SelectItem>
                <SelectItem value="needs_repair">Needs Repair</SelectItem>
                <SelectItem value="beyond_capacity">Beyond Workshop Capacity</SelectItem>
                <SelectItem value="unserviceable">Unserviceable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Defects Found</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={defectInput}
                onChange={(e) => setDefectInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDefect();
                  }
                }}
                placeholder="Add defect description..."
              />
              <Button type="button" onClick={addDefect} variant="outline">
                Add
              </Button>
            </div>
            {formData.defects_found.length > 0 && (
              <div className="space-y-1">
                {formData.defects_found.map((defect, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{defect}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDefect(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(formData.inspection_status === 'needs_repair' || formData.inspection_status === 'beyond_capacity') && (
            <>
              <div>
                <Label htmlFor="repair_required">Repair Required</Label>
                <Textarea
                  id="repair_required"
                  value={formData.repair_required}
                  onChange={(e) => setFormData({ ...formData, repair_required: e.target.value })}
                  rows={3}
                  placeholder="Describe the repair required..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_repair_cost">Estimated Repair Cost</Label>
                  <Input
                    id="estimated_repair_cost"
                    type="number"
                    step="0.01"
                    value={formData.estimated_repair_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_repair_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="repair_capacity">Repair Capacity</Label>
                  <Select
                    value={formData.repair_capacity}
                    onValueChange={(value) => setFormData({ ...formData, repair_capacity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop_capacity">Within Workshop Capacity</SelectItem>
                      <SelectItem value="beyond_capacity">Beyond Workshop Capacity</SelectItem>
                      <SelectItem value="civilian_firm_required">Civilian Firm Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

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
              {loading ? (inspection ? "Updating..." : "Recording...") : (inspection ? "Update Inspection" : "Record Inspection")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

