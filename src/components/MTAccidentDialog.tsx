import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface MTAccidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  accident?: any; // For editing
}

export function MTAccidentDialog({ open, onOpenChange, onSuccess, accident }: MTAccidentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    vehicle_id: "",
    driver_id: "",
    accident_date: new Date().toISOString().split("T")[0],
    accident_time: "",
    location: "",
    accident_type: "collision",
    weather_conditions: "",
    road_conditions: "",
    speed_limit: "",
    vehicle_speed: "",
    passengers_injured: 0,
    pedestrians_injured: 0,
    property_damage_description: "",
    vehicle_damage_description: "",
    police_report_number: "",
    police_station: "",
    estimated_repair_cost: "",
    liability: "pending",
    driver_statement: "",
    reported_to_police: false,
    police_report_filed: false,
    reported_to_mto: false,
    reported_to_orderly_officer: false,
    status: "reported",
    notes: "",
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles_for_accident"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id, vehicle_id, vehicle_type").order("vehicle_id");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers_for_accident"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, name, rank").order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      if (accident) {
        setFormData({
          vehicle_id: accident.vehicle_id || "",
          driver_id: accident.driver_id || "",
          accident_date: accident.accident_date || new Date().toISOString().split("T")[0],
          accident_time: accident.accident_time || "",
          location: accident.location || "",
          accident_type: accident.accident_type || "collision",
          weather_conditions: accident.weather_conditions || "",
          road_conditions: accident.road_conditions || "",
          speed_limit: accident.speed_limit?.toString() || "",
          vehicle_speed: accident.vehicle_speed?.toString() || "",
          passengers_injured: accident.passengers_injured || 0,
          pedestrians_injured: accident.pedestrians_injured || 0,
          property_damage_description: accident.property_damage_description || "",
          vehicle_damage_description: accident.vehicle_damage_description || "",
          police_report_number: accident.police_report_number || "",
          police_station: accident.police_station || "",
          estimated_repair_cost: accident.estimated_repair_cost?.toString() || "",
          liability: accident.liability || "pending",
          driver_statement: accident.driver_statement || "",
          reported_to_police: accident.reported_to_police || false,
          police_report_filed: accident.police_report_filed || false,
          reported_to_mto: accident.reported_to_mto || false,
          reported_to_orderly_officer: accident.reported_to_orderly_officer || false,
          status: accident.status || "reported",
          notes: accident.notes || "",
        });
      } else {
        setFormData((prev: any) => ({ ...prev, accident_date: new Date().toISOString().split("T")[0] }));
      }
    }
  }, [accident, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }

    setLoading(true);

    try {
      let accident_number = accident?.accident_number;
      if (!accident_number) {
        const timestamp = Date.now().toString().slice(-6);
        accident_number = `MTA-${timestamp}`;
      }

      const payload: any = {
        accident_number,
        vehicle_id: formData.vehicle_id || null,
        driver_id: formData.driver_id || null,
        accident_date: formData.accident_date,
        accident_time: formData.accident_time || null,
        location: formData.location,
        accident_type: formData.accident_type || null,
        weather_conditions: formData.weather_conditions || null,
        road_conditions: formData.road_conditions || null,
        speed_limit: formData.speed_limit ? parseInt(formData.speed_limit, 10) : null,
        vehicle_speed: formData.vehicle_speed ? parseInt(formData.vehicle_speed, 10) : null,
        passengers_injured: formData.passengers_injured || 0,
        pedestrians_injured: formData.pedestrians_injured || 0,
        property_damage_description: formData.property_damage_description || null,
        vehicle_damage_description: formData.vehicle_damage_description || null,
        police_report_number: formData.police_report_number || null,
        police_station: formData.police_station || null,
        estimated_repair_cost: formData.estimated_repair_cost ? parseFloat(formData.estimated_repair_cost) : null,
        liability: formData.liability,
        driver_statement: formData.driver_statement || null,
        reported_to_police: formData.reported_to_police,
        police_report_filed: formData.police_report_filed,
        reported_to_mto: formData.reported_to_mto,
        reported_to_orderly_officer: formData.reported_to_orderly_officer,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (accident) {
        const { error } = await supabase.from("mt_accidents").update(payload).eq("id", accident.id);
        if (error) throw error;
        toast.success("Accident report updated");
      } else {
        const { error } = await supabase.from("mt_accidents").insert([payload]);
        if (error) throw error;
        toast.success("Accident reported");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save accident report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{accident ? "Edit Accident Report" : "Report Accident"}</DialogTitle>
          <DialogDescription>Record a motor transport accident for investigation and reporting.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
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
              <Label htmlFor="driver_id">Driver</Label>
              <Select value={formData.driver_id} onValueChange={(value) => setFormData({ ...formData, driver_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.rank} {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="accident_date">Date *</Label>
              <Input
                id="accident_date"
                type="date"
                value={formData.accident_date}
                onChange={(e) => setFormData({ ...formData, accident_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="accident_time">Time</Label>
              <Input
                id="accident_time"
                type="time"
                value={formData.accident_time}
                onChange={(e) => setFormData({ ...formData, accident_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="accident_type">Type</Label>
              <Select value={formData.accident_type} onValueChange={(value) => setFormData({ ...formData, accident_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collision">Collision</SelectItem>
                  <SelectItem value="single_vehicle">Single Vehicle</SelectItem>
                  <SelectItem value="pedestrian">Pedestrian</SelectItem>
                  <SelectItem value="property_damage">Property Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Location of accident"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weather_conditions">Weather Conditions</Label>
              <Input
                id="weather_conditions"
                value={formData.weather_conditions}
                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="road_conditions">Road Conditions</Label>
              <Input
                id="road_conditions"
                value={formData.road_conditions}
                onChange={(e) => setFormData({ ...formData, road_conditions: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="speed_limit">Speed Limit</Label>
              <Input
                id="speed_limit"
                type="number"
                value={formData.speed_limit}
                onChange={(e) => setFormData({ ...formData, speed_limit: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vehicle_speed">Vehicle Speed</Label>
              <Input
                id="vehicle_speed"
                type="number"
                value={formData.vehicle_speed}
                onChange={(e) => setFormData({ ...formData, vehicle_speed: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="passengers_injured">Passengers Injured</Label>
              <Input
                id="passengers_injured"
                type="number"
                min="0"
                value={formData.passengers_injured}
                onChange={(e) => setFormData({ ...formData, passengers_injured: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="pedestrians_injured">Pedestrians Injured</Label>
              <Input
                id="pedestrians_injured"
                type="number"
                min="0"
                value={formData.pedestrians_injured}
                onChange={(e) => setFormData({ ...formData, pedestrians_injured: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vehicle_damage_description">Vehicle Damage Description</Label>
            <Textarea
              id="vehicle_damage_description"
              value={formData.vehicle_damage_description}
              onChange={(e) => setFormData({ ...formData, vehicle_damage_description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="property_damage_description">Property Damage Description</Label>
            <Textarea
              id="property_damage_description"
              value={formData.property_damage_description}
              onChange={(e) => setFormData({ ...formData, property_damage_description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="driver_statement">Driver Statement</Label>
            <Textarea
              id="driver_statement"
              value={formData.driver_statement}
              onChange={(e) => setFormData({ ...formData, driver_statement: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="police_report_number">Police Report #</Label>
              <Input
                id="police_report_number"
                value={formData.police_report_number}
                onChange={(e) => setFormData({ ...formData, police_report_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="police_station">Police Station</Label>
              <Input
                id="police_station"
                value={formData.police_station}
                onChange={(e) => setFormData({ ...formData, police_station: e.target.value })}
              />
            </div>
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
              />
            </div>
            <div>
              <Label htmlFor="liability">Liability</Label>
              <Select value={formData.liability} onValueChange={(value) => setFormData({ ...formData, liability: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="at_fault">At Fault</SelectItem>
                  <SelectItem value="not_at_fault">Not At Fault</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reported_to_police"
                checked={formData.reported_to_police}
                onCheckedChange={(checked) => setFormData({ ...formData, reported_to_police: !!checked })}
              />
              <Label htmlFor="reported_to_police" className="font-normal">Reported to Police</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="police_report_filed"
                checked={formData.police_report_filed}
                onCheckedChange={(checked) => setFormData({ ...formData, police_report_filed: !!checked })}
              />
              <Label htmlFor="police_report_filed" className="font-normal">Police Report Filed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reported_to_mto"
                checked={formData.reported_to_mto}
                onCheckedChange={(checked) => setFormData({ ...formData, reported_to_mto: !!checked })}
              />
              <Label htmlFor="reported_to_mto" className="font-normal">Reported to MTO</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reported_to_orderly_officer"
                checked={formData.reported_to_orderly_officer}
                onCheckedChange={(checked) => setFormData({ ...formData, reported_to_orderly_officer: !!checked })}
              />
              <Label htmlFor="reported_to_orderly_officer" className="font-normal">Reported to Orderly Officer</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Saving..." : accident ? "Update Report" : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
