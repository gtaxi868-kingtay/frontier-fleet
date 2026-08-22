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

interface VehicleInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  inspection?: any; // For editing
}

const CONDITION_FIELDS: { key: string; label: string }[] = [
  { key: "engine_condition", label: "Engine" },
  { key: "transmission_condition", label: "Transmission" },
  { key: "brakes_condition", label: "Brakes" },
  { key: "steering_condition", label: "Steering" },
  { key: "suspension_condition", label: "Suspension" },
  { key: "electrical_condition", label: "Electrical" },
  { key: "body_condition", label: "Body" },
  { key: "tires_condition", label: "Tires" },
  { key: "lights_condition", label: "Lights" },
];

export function VehicleInspectionDialog({ open, onOpenChange, onSuccess, inspection }: VehicleInspectionDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [defectInput, setDefectInput] = useState("");
  const [formData, setFormData] = useState<any>({
    vehicle_id: "",
    inspection_type: "monthly",
    form_type: "TTR_16",
    inspection_date: new Date().toISOString().split("T")[0],
    inspector_name: "",
    inspector_role: "",
    serviceability_status: "serviceable",
    driver_servicing_efficiency: "",
    defects_found: [] as string[],
    recommendation: "",
    notes: "",
    engine_condition: "",
    transmission_condition: "",
    brakes_condition: "",
    steering_condition: "",
    suspension_condition: "",
    electrical_condition: "",
    body_condition: "",
    tires_condition: "",
    lights_condition: "",
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles_for_inspection_dialog"],
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

  useEffect(() => {
    if (open) {
      if (inspection) {
        setFormData({
          vehicle_id: inspection.vehicle_id || "",
          inspection_type: inspection.inspection_type || "monthly",
          form_type: inspection.form_type || "TTR_16",
          inspection_date: inspection.inspection_date || new Date().toISOString().split("T")[0],
          inspector_name: inspection.inspector_name || "",
          inspector_role: inspection.inspector_role || "",
          serviceability_status: inspection.serviceability_status || "serviceable",
          driver_servicing_efficiency: inspection.driver_servicing_efficiency || "",
          defects_found: inspection.defects_found || [],
          recommendation: inspection.recommendation || "",
          notes: inspection.notes || "",
          engine_condition: inspection.engine_condition || "",
          transmission_condition: inspection.transmission_condition || "",
          brakes_condition: inspection.brakes_condition || "",
          steering_condition: inspection.steering_condition || "",
          suspension_condition: inspection.suspension_condition || "",
          electrical_condition: inspection.electrical_condition || "",
          body_condition: inspection.body_condition || "",
          tires_condition: inspection.tires_condition || "",
          lights_condition: inspection.lights_condition || "",
        });
      } else {
        setFormData((prev: any) => ({ ...prev, inspection_date: new Date().toISOString().split("T")[0] }));
      }
    }
  }, [inspection, open]);

  const isTechnical = formData.form_type === "TTR_17";

  const addDefect = () => {
    if (defectInput.trim()) {
      setFormData((prev: any) => ({ ...prev, defects_found: [...prev.defects_found, defectInput.trim()] }));
      setDefectInput("");
    }
  };

  const removeDefect = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      defects_found: prev.defects_found.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let inspection_number = inspection?.inspection_number;
      if (!inspection_number) {
        const timestamp = Date.now().toString().slice(-6);
        inspection_number = `${formData.form_type}-${timestamp}`;
      }

      // Monthly (TTR 16) inspections are due again next month; technical (TTR 17) every 6 months
      const inspectionDate = new Date(formData.inspection_date);
      const nextInspectionDate = new Date(inspectionDate);
      nextInspectionDate.setMonth(nextInspectionDate.getMonth() + (isTechnical ? 6 : 1));

      const payload: any = {
        inspection_number,
        vehicle_id: formData.vehicle_id,
        inspection_type: formData.inspection_type,
        form_type: formData.form_type,
        inspection_date: formData.inspection_date,
        inspected_by_id: profile?.id,
        inspector_name: formData.inspector_name || null,
        inspector_role: formData.inspector_role || null,
        serviceability_status: formData.serviceability_status,
        driver_servicing_efficiency: formData.driver_servicing_efficiency || null,
        defects_found: formData.defects_found,
        recommendation: formData.recommendation || null,
        next_inspection_due: nextInspectionDate.toISOString().split("T")[0],
        notes: formData.notes || null,
      };

      if (isTechnical) {
        CONDITION_FIELDS.forEach(({ key }) => {
          payload[key] = formData[key] || null;
        });
      }

      if (inspection) {
        const { error } = await supabase.from("vehicle_inspections").update(payload).eq("id", inspection.id);
        if (error) throw error;
        toast.success("Vehicle inspection updated");
      } else {
        const { error } = await supabase.from("vehicle_inspections").insert([payload]);
        if (error) throw error;
        toast.success("Vehicle inspection recorded");
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
          <DialogTitle>{inspection ? "Edit Vehicle Inspection" : "Record Vehicle Inspection"}</DialogTitle>
          <DialogDescription>
            TTR Form 16 (monthly) or TTR Form 17 (technical) vehicle inspection.
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
              <Label htmlFor="form_type">Form Type *</Label>
              <Select
                value={formData.form_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    form_type: value,
                    inspection_type: value === "TTR_17" ? "technical" : "monthly",
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TTR_16">TTR 16 - Monthly Inspection</SelectItem>
                  <SelectItem value="TTR_17">TTR 17 - Technical Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <Label htmlFor="serviceability_status">Serviceability *</Label>
              <Select
                value={formData.serviceability_status}
                onValueChange={(value) => setFormData({ ...formData, serviceability_status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serviceable">Serviceable</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="unserviceable">Unserviceable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inspector_name">Inspector Name</Label>
              <Input
                id="inspector_name"
                value={formData.inspector_name}
                onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                placeholder="If not a system user"
              />
            </div>
            <div>
              <Label htmlFor="inspector_role">Inspector Role</Label>
              <Input
                id="inspector_role"
                value={formData.inspector_role}
                onChange={(e) => setFormData({ ...formData, inspector_role: e.target.value })}
                placeholder="e.g. MT NCO, Workshop Fitter"
              />
            </div>
          </div>

          {!isTechnical && (
            <div>
              <Label htmlFor="driver_servicing_efficiency">Driver Servicing Efficiency</Label>
              <Textarea
                id="driver_servicing_efficiency"
                value={formData.driver_servicing_efficiency}
                onChange={(e) => setFormData({ ...formData, driver_servicing_efficiency: e.target.value })}
                rows={2}
                placeholder="Assessment of driver's daily servicing standard..."
              />
            </div>
          )}

          {isTechnical && (
            <div className="space-y-2 border rounded-lg p-4">
              <Label>Technical Condition</Label>
              <div className="grid grid-cols-3 gap-3">
                {CONDITION_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <Label htmlFor={key} className="text-xs text-muted-foreground">{label}</Label>
                    <Select
                      value={formData[key]}
                      onValueChange={(value) => setFormData({ ...formData, [key]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Defects Found</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={defectInput}
                onChange={(e) => setDefectInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
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
                {formData.defects_found.map((defect: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{defect}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDefect(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="recommendation">Recommendation</Label>
            <Textarea
              id="recommendation"
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : inspection ? "Update Inspection" : "Record Inspection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
