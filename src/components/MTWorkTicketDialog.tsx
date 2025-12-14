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

interface MTWorkTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MTWorkTicketDialog({ open, onOpenChange, onSuccess }: MTWorkTicketDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticket_number: "",
    vehicle_id: "",
    driver_id: "",
    journey_purpose: "",
    destination: "",
    route: "",
    load_description: "",
    passenger_count: "0",
    authorized_by: "MTO",
    issue_date: new Date().toISOString().split('T')[0],
    issue_time: new Date().toTimeString().slice(0, 5),
    mileage_start: "",
    petrol_issued: "",
    oil_issued: "",
    condition_on_issue: "Good",
    notes: "",
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_id, vehicle_type, serviceability')
        .eq('serviceability', 'Serviceable')
        .order('vehicle_id');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch drivers with active permits
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers_with_permits'],
    queryFn: async () => {
      const { data: permits, error: permitsError } = await supabase
        .from('mt_driver_permits')
        .select('soldier_id, permit_number')
        .eq('status', 'active');
      
      if (permitsError) throw permitsError;
      
      if (!permits || permits.length === 0) return [];
      
      const driverIds = permits.map(p => p.soldier_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, rank')
        .in('id', driverIds);
      
      if (profilesError) throw profilesError;
      
      return profiles || [];
    },
  });

  // Generate ticket number on mount
  useEffect(() => {
    if (open && !formData.ticket_number) {
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({ ...prev, ticket_number: `WT-${timestamp}` }));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.vehicle_id || !formData.driver_id || !formData.destination) {
        toast.error("Please fill in all required fields");
        return;
      }

      const workTicketData = {
        ticket_number: formData.ticket_number,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        authorized_by: profile?.id, // Changed from issued_by_id
        purpose: formData.journey_purpose, // Changed from journey_purpose to purpose
        destination: formData.destination,
        start_mileage: formData.mileage_start ? parseInt(formData.mileage_start) : null,
        fuel_issued: formData.petrol_issued ? parseFloat(formData.petrol_issued) : null,
        departure_time: formData.issue_time ? new Date(`${formData.issue_date}T${formData.issue_time}`).toISOString() : null,
        notes: formData.notes || null,
        status: 'Active',
      };

      const { error } = await supabase
        .from('mt_work_tickets')
        .insert([workTicketData]);

      if (error) throw error;

      toast.success("Work ticket created successfully");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        ticket_number: "",
        vehicle_id: "",
        driver_id: "",
        journey_purpose: "",
        destination: "",
        route: "",
        load_description: "",
        passenger_count: "0",
        authorized_by: "MTO",
        issue_date: new Date().toISOString().split('T')[0],
        issue_time: new Date().toTimeString().slice(0, 5),
        mileage_start: "",
        petrol_issued: "",
        oil_issued: "",
        condition_on_issue: "Good",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create work ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Ticket</DialogTitle>
          <DialogDescription>
            Create a new work ticket for vehicle assignment and journey tracking
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticket_number">Ticket Number *</Label>
              <Input
                id="ticket_number"
                value={formData.ticket_number}
                onChange={(e) => setFormData({ ...formData, ticket_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="authorized_by">Authorized By *</Label>
              <Select
                value={formData.authorized_by}
                onValueChange={(value) => setFormData({ ...formData, authorized_by: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTO">MTO</SelectItem>
                  <SelectItem value="MT Sgt">MT Sergeant</SelectItem>
                  <SelectItem value="Other">Other Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                  {vehicles.map((vehicle: any) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_id} - {vehicle.vehicle_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="driver_id">Driver *</Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                required
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
            <Label htmlFor="journey_purpose">Journey Purpose *</Label>
            <Input
              id="journey_purpose"
              value={formData.journey_purpose}
              onChange={(e) => setFormData({ ...formData, journey_purpose: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="route">Route</Label>
              <Input
                id="route"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="load_description">Load Description</Label>
              <Input
                id="load_description"
                value={formData.load_description}
                onChange={(e) => setFormData({ ...formData, load_description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="passenger_count">Passenger Count</Label>
              <Input
                id="passenger_count"
                type="number"
                min="0"
                value={formData.passenger_count}
                onChange={(e) => setFormData({ ...formData, passenger_count: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="issue_time">Issue Time</Label>
              <Input
                id="issue_time"
                type="time"
                value={formData.issue_time}
                onChange={(e) => setFormData({ ...formData, issue_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="mileage_start">Starting Mileage</Label>
              <Input
                id="mileage_start"
                type="number"
                value={formData.mileage_start}
                onChange={(e) => setFormData({ ...formData, mileage_start: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="petrol_issued">Petrol Issued (Litres)</Label>
              <Input
                id="petrol_issued"
                type="number"
                step="0.01"
                value={formData.petrol_issued}
                onChange={(e) => setFormData({ ...formData, petrol_issued: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="oil_issued">Oil Issued (Litres)</Label>
              <Input
                id="oil_issued"
                type="number"
                step="0.01"
                value={formData.oil_issued}
                onChange={(e) => setFormData({ ...formData, oil_issued: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="condition_on_issue">Condition on Issue</Label>
            <Select
              value={formData.condition_on_issue}
              onValueChange={(value) => setFormData({ ...formData, condition_on_issue: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Creating..." : "Create Work Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

